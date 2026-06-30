import express from 'express';
import cron from 'node-cron';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { ContentBlockType } from '../api/integrated-ai.js';
import { dailyBlogPublisher, trendjackingPublisher } from '../jobs/index.js';

const router = express.Router();

// Region rotation state
let currentRegionIndex = 0;
const regions = ['US', 'UK', 'EU'];

const getNextRegion = () => {
  const region = regions[currentRegionIndex];
  currentRegionIndex = (currentRegionIndex + 1) % regions.length;
  return region;
};

/**
 * Get PocketBase admin authentication token
 */
async function getAdminAuthToken(logger) {
  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      logger.warn('⚠️ POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not configured');
      throw new Error('PocketBase admin credentials not configured');
    }

    logger.info('🔐 Authenticating as PocketBase admin for scheduled job...');
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    const adminToken = pb.authStore.token;

    if (!adminToken) {
      throw new Error('Failed to obtain admin authentication token');
    }

    logger.info('✅ Admin authentication successful for scheduled job');
    return adminToken;
  } catch (error) {
    logger.error('❌ Admin authentication failed for scheduled job', { error: error.message });
    throw error;
  }
}

// Helper function to call integrated AI stream endpoint
const callAIStream = async (prompt, adminToken) => {
  const userMessage = JSON.stringify([{ type: 'text', text: prompt }]);
  
  const response = await fetch('http://localhost:3001/hcgi/api/integrated-ai/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      message: userMessage,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI stream request failed: ${response.status} ${response.statusText}`);
  }

  // Parse SSE stream and collect content
  let fullContent = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'content') {
              fullContent += event.data.content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
};

// Daily blog auto-publishing job (9 AM UTC)
const dailyBlogJob = cron.schedule('0 9 * * *', async () => {
  logger.info('🚀 Starting daily blog auto-publishing job');

  try {
    const adminToken = await getAdminAuthToken(logger);
    const region = getNextRegion();
    logger.info(`📍 Publishing blog for region: ${region}`);

    // Generate blog post via AI
    const blogPrompt = `Generate a 1500+ word blog post about ${region} career trends, labor market research, or wealth-building strategies. Include: AI-generated title, 1500+ word body with clear sections and statistics, professional tone. Region: ${region}. Format your response as JSON with fields: {"title": "...", "content": "..."}`;

    const blogContent = await callAIStream(blogPrompt, adminToken);
    logger.info('📝 Blog content generated from AI');

    // Parse blog content
    let parsedBlog;
    try {
      // Extract JSON from the response
      const jsonMatch = blogContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedBlog = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from AI response');
      }
    } catch (parseError) {
      logger.warn('Could not parse blog JSON, using raw content');
      parsedBlog = {
        title: `${region} Career Trends and Market Insights`,
        content: blogContent,
      };
    }

    // Generate featured image via AI
    const imagePrompt = `Create a professional featured image for a blog post about ${region} career trends and labor market insights. Style: modern, professional, data-driven.`;
    const imageContent = await callAIStream(imagePrompt, adminToken);
    logger.info('🖼️ Featured image generated from AI');

    // Extract image URL from AI response (assuming it returns a URL or image reference)
    let featuredImageUrl = '';
    try {
      const urlMatch = imageContent.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        featuredImageUrl = urlMatch[0];
      }
    } catch (e) {
      logger.warn('Could not extract image URL from AI response');
    }

    // Save to PocketBase
    const record = await pb.collection('ai_blog_posts').create({
      title: parsedBlog.title || `${region} Career Trends and Market Insights`,
      content: parsedBlog.content || blogContent,
      featured_image_url: featuredImageUrl || null,
      author: 'GTrends AI Research',
      region: region,
      published_date: new Date().toISOString(),
    });

    logger.info(`✅ Blog post published successfully`, { postId: record.id, region });
  } catch (error) {
    logger.error('❌ Daily blog job failed:', error.message);
    throw error;
  }
});

// Weekly newsletter job (Monday 9 AM UTC)
const weeklyNewsletterJob = cron.schedule('0 9 * * 1', async () => {
  logger.info('🚀 Starting weekly newsletter job');

  try {
    const adminToken = await getAdminAuthToken(logger);

    // Fetch top 3 trending jobs
    const jobs = await pb.collection('hydra_leads').getList(1, 3, {
      sort: '-timestamp',
    });
    logger.info(`📊 Fetched ${jobs.items.length} trending jobs`);

    // Fetch latest blog post
    const blogPosts = await pb.collection('ai_blog_posts').getList(1, 1, {
      sort: '-published_date',
    });
    const latestBlog = blogPosts.items[0] || null;
    logger.info('📝 Fetched latest blog post');

    // Generate market insights
    const region = regions[currentRegionIndex];
    const insightsPrompt = `Generate 3-4 bullet points of weekly market insights for ${region} labor market and financial trends. Format as a simple list with bullet points.`;
    const insights = await callAIStream(insightsPrompt, adminToken);
    logger.info('💡 Generated market insights');

    // Fetch all newsletter subscribers
    const subscribers = await pb.collection('newsletter_subscribers').getFullList();
    logger.info(`📧 Fetched ${subscribers.length} newsletter subscribers`);

    if (subscribers.length === 0) {
      logger.warn('No newsletter subscribers found');
      return;
    }

    // Build HTML email template
    const buildEmailTemplate = (jobs, blog, insights) => {
      const jobsHtml = jobs.map(job => `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${job.title || 'Job Opportunity'}</h4>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">${job.description || ''}</p>
        </div>
      `).join('');

      const blogHtml = blog ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Latest Blog Post</h3>
          <h4 style="margin: 0 0 10px 0; color: #007bff;">${blog.title}</h4>
          <p style="margin: 0; color: #666; font-size: 14px;">${blog.content.substring(0, 200)}...</p>
          <a href="https://gtrendsnow.com/blog/${blog.id}" style="color: #007bff; text-decoration: none; font-weight: bold;">Read More →</a>
        </div>
      ` : '';

      const insightsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Weekly Market Insights</h3>
          <div style="color: #666; font-size: 14px; line-height: 1.6;">${insights.replace(/\n/g, '<br>')}</div>
        </div>
      `;

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #fff; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">GTrends Weekly Newsletter</h1>
              <p style="margin: 5px 0 0 0;">Your weekly dose of career trends and market insights</p>
            </div>
            <div class="content">
              <h2 style="color: #007bff; margin-top: 0;">🔥 Top Trending Jobs This Week</h2>
              ${jobsHtml}
              ${blogHtml}
              ${insightsHtml}
              <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">✨ VIP Offers</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">Check out our exclusive career development resources and premium tools.</p>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 10px 0;">© 2024 GTrends. All rights reserved.</p>
              <p style="margin: 5px 0;"><a href="https://gtrendsnow.com/unsubscribe">Unsubscribe from this newsletter</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const emailHtml = buildEmailTemplate(jobs.items, latestBlog, insights);

    // Send emails via PocketBase built-in mailer
    let successCount = 0;
    let failureCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Use PocketBase's built-in mail client
        const mailClient = pb.newMailClient();
        await mailClient.send({
          from: {
            address: 'newsletter@gtrendsnow.com',
            name: 'GTrends Newsletter',
          },
          to: [{ address: subscriber.email }],
          subject: 'GTrends Weekly Newsletter - Career Trends & Market Insights',
          html: emailHtml,
        });
        successCount++;
        logger.info(`📧 Newsletter sent to ${subscriber.email}`);
      } catch (error) {
        failureCount++;
        logger.error(`❌ Failed to send newsletter to ${subscriber.email}:`, error.message);
      }
    }

    logger.info(`✅ Weekly newsletter job completed`, { successCount, failureCount, totalSubscribers: subscribers.length });
  } catch (error) {
    logger.error('❌ Weekly newsletter job failed:', error.message);
    throw error;
  }
});

// Health check endpoint to verify jobs are running
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    jobs: {
      dailyBlog: 'scheduled (9 AM UTC)',
      weeklyNewsletter: 'scheduled (Monday 9 AM UTC)',
      currentRegion: regions[currentRegionIndex],
    },
  });
});

// Manual trigger endpoints for testing
router.post('/trigger-daily-blog', async (req, res) => {
  logger.info('🚀 Manually triggering daily blog job');
  try {
    await dailyBlogPublisher(pb, logger);
    res.json({ success: true, message: 'Daily blogs triggered for all 4 categories' });
  } catch (error) {
    logger.error('❌ Manual blog trigger failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trigger-trendjacking', async (req, res) => {
  logger.info('🚀 Manually triggering trendjacking job');
  try {
    await trendjackingPublisher(pb, logger);
    res.json({ success: true, message: 'Trendjacking articles generated successfully' });
  } catch (error) {
    logger.error('❌ Manual trendjacking trigger failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trigger-weekly-newsletter', async (req, res) => {
  logger.info('🚀 Manually triggering weekly newsletter job');
  try {
    const adminToken = await getAdminAuthToken(logger);

    const jobs = await pb.collection('hydra_leads').getList(1, 3, {
      sort: '-timestamp',
    });
    logger.info(`📊 Fetched ${jobs.items.length} trending jobs`);

    const blogPosts = await pb.collection('ai_blog_posts').getList(1, 1, {
      sort: '-published_date',
    });
    const latestBlog = blogPosts.items[0] || null;
    logger.info('📝 Fetched latest blog post');

    const region = regions[currentRegionIndex];
    const insightsPrompt = `Generate 3-4 bullet points of weekly market insights for ${region} labor market and financial trends. Format as a simple list with bullet points.`;
    const insights = await callAIStream(insightsPrompt, adminToken);
    logger.info('💡 Generated market insights');

    const subscribers = await pb.collection('newsletter_subscribers').getFullList();
    logger.info(`📧 Fetched ${subscribers.length} newsletter subscribers`);

    if (subscribers.length === 0) {
      logger.warn('No newsletter subscribers found');
      return res.json({ success: true, message: 'No subscribers to send to' });
    }

    const buildEmailTemplate = (jobs, blog, insights) => {
      const jobsHtml = jobs.map(job => `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${job.title || 'Job Opportunity'}</h4>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">${job.description || ''}</p>
        </div>
      `).join('');

      const blogHtml = blog ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Latest Blog Post</h3>
          <h4 style="margin: 0 0 10px 0; color: #007bff;">${blog.title}</h4>
          <p style="margin: 0; color: #666; font-size: 14px;">${blog.content.substring(0, 200)}...</p>
          <a href="https://gtrendsnow.com/blog/${blog.id}" style="color: #007bff; text-decoration: none; font-weight: bold;">Read More →</a>
        </div>
      ` : '';

      const insightsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Weekly Market Insights</h3>
          <div style="color: #666; font-size: 14px; line-height: 1.6;">${insights.replace(/\n/g, '<br>')}</div>
        </div>
      `;

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #fff; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">GTrends Weekly Newsletter</h1>
              <p style="margin: 5px 0 0 0;">Your weekly dose of career trends and market insights</p>
            </div>
            <div class="content">
              <h2 style="color: #007bff; margin-top: 0;">🔥 Top Trending Jobs This Week</h2>
              ${jobsHtml}
              ${blogHtml}
              ${insightsHtml}
              <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">✨ VIP Offers</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">Check out our exclusive career development resources and premium tools.</p>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 10px 0;">© 2024 GTrends. All rights reserved.</p>
              <p style="margin: 5px 0;"><a href="https://gtrendsnow.com/unsubscribe">Unsubscribe from this newsletter</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const emailHtml = buildEmailTemplate(jobs.items, latestBlog, insights);

    let successCount = 0;
    let failureCount = 0;

    for (const subscriber of subscribers) {
      try {
        const mailClient = pb.newMailClient();
        await mailClient.send({
          from: {
            address: 'newsletter@gtrendsnow.com',
            name: 'GTrends Newsletter',
          },
          to: [{ address: subscriber.email }],
          subject: 'GTrends Weekly Newsletter - Career Trends & Market Insights',
          html: emailHtml,
        });
        successCount++;
        logger.info(`📧 Newsletter sent to ${subscriber.email}`);
      } catch (error) {
        failureCount++;
        logger.error(`❌ Failed to send newsletter to ${subscriber.email}:`, error.message);
      }
    }

    logger.info(`✅ Weekly newsletter job completed`, { successCount, failureCount, totalSubscribers: subscribers.length });
    res.json({ success: true, message: 'Newsletters sent', successCount, failureCount });
  } catch (error) {
    logger.error('❌ Manual newsletter trigger failed:', error.message);
    throw error;
  }
});

export default router;