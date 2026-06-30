/**
 * Get PocketBase admin authentication token
 */
async function getAdminAuthToken(pb, logger) {
  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      logger.warn('⚠️ POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not configured');
      throw new Error('PocketBase admin credentials not configured');
    }

    logger.info('🔐 Authenticating as PocketBase admin for weekly newsletter job...');
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    const adminToken = pb.authStore.token;

    if (!adminToken) {
      throw new Error('Failed to obtain admin authentication token');
    }

    logger.info('✅ Admin authentication successful for weekly newsletter job');
    return adminToken;
  } catch (error) {
    logger.error('❌ Admin authentication failed for weekly newsletter job', { error: error.message });
    throw error;
  }
}

/**
 * Stream AI response and collect full content
 */
async function streamAIResponse(prompt, adminToken, logger) {
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
}

/**
 * Weekly newsletter job
 */
export async function weeklyNewsletter(pb, logger) {
  logger.info('🚀 Starting weekly newsletter job');

  try {
    // Get admin authentication token
    const adminToken = await getAdminAuthToken(pb, logger);

    // Fetch all newsletter subscribers
    let subscribers = [];
    try {
      subscribers = await pb.collection('newsletter_subscribers').getFullList();
    } catch (error) {
      logger.warn('newsletter_subscribers collection not found, trying users collection with vipVault filter');
      try {
        const vipUsers = await pb.collection('users').getFullList({
          filter: 'vipVault = true',
        });
        subscribers = vipUsers;
      } catch (vipError) {
        logger.warn('Could not fetch subscribers from either collection');
        subscribers = [];
      }
    }

    if (subscribers.length === 0) {
      logger.warn('No newsletter subscribers found');
      return;
    }

    logger.info(`📧 Fetched ${subscribers.length} newsletter subscribers`);

    // Fetch top 3 trending jobs
    const jobsResult = await pb.collection('hydra_leads').getList(1, 3, {
      sort: '-timestamp',
    });
    const jobs = jobsResult.items || [];
    logger.info(`📊 Fetched ${jobs.length} trending jobs`);

    // Fetch latest blog post
    const blogResult = await pb.collection('ai_blog_posts').getList(1, 1, {
      sort: '-publishedAt',
    });
    const latestBlog = blogResult.items?.[0] || null;
    logger.info('📝 Fetched latest blog post');

    // Determine region for insights
    const regions = ['US', 'UK', 'EU'];
    const regionIndex = Math.floor(Math.random() * regions.length);
    const region = regions[regionIndex];

    // Generate market insights via AI
    const insightsPrompt = `Generate 3-4 bullet points of weekly market insights for ${region} labor market and financial trends. Keep each point to 1-2 sentences.`;
    const insightsContent = await streamAIResponse(insightsPrompt, adminToken, logger);
    logger.info('💡 Generated market insights');

    // Build HTML email template
    const jobsHtml = jobs
      .map(
        (job) => `
      <div class="job-item">
        <h4 style="margin: 0 0 5px 0; color: #333;">${job.title || 'Job Opportunity'}</h4>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">${job.description || job.company || ''}</p>
      </div>
    `
      )
      .join('');

    const blogSummary = latestBlog
      ? latestBlog.content.substring(0, 200) + '...'
      : 'Check out our latest insights on career trends and market analysis.';

    const insightsHtml = insightsContent
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => `<li>${line.replace(/^[-•*]\s*/, '')}</li>`)
      .join('');

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 20px; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background: #f9f9f9; }
    .section h2 { margin: 0 0 15px 0; color: #333; font-size: 18px; }
    .job-item { margin: 10px 0; padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #e0e0e0; }
    .job-item h4 { margin: 0 0 5px 0; color: #333; font-size: 14px; }
    .job-item p { margin: 5px 0; color: #666; font-size: 13px; }
    .blog-section { background: #f0f4ff; padding: 15px; border-radius: 5px; }
    .blog-section h3 { margin: 0 0 10px 0; color: #667eea; }
    .blog-section p { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .blog-section a { color: #667eea; text-decoration: none; font-weight: bold; }
    .insights-list { margin: 0; padding-left: 20px; }
    .insights-list li { margin: 8px 0; color: #666; font-size: 14px; line-height: 1.5; }
    .vip-section { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
    .vip-section h2 { color: #856404; }
    .vip-section p { color: #856404; margin: 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GTrends Weekly</h1>
      <p>Your Exclusive Market Insights</p>
    </div>
    <div class="content">
      <div class="section">
        <h2>🔥 Top 3 Trending Jobs</h2>
        ${jobsHtml || '<p>No trending jobs available this week.</p>'}
      </div>
      ${latestBlog ? `
      <div class="section blog-section">
        <h3>${latestBlog.title || 'Latest Blog Post'}</h3>
        <p>${blogSummary}</p>
        <a href="https://gtrendsglobal.com/blog/${latestBlog.id}">Read Full Article →</a>
      </div>
      ` : ''}
      <div class="section">
        <h2>📊 Weekly Market Insights</h2>
        <ul class="insights-list">
          ${insightsHtml || '<li>Market analysis and trends for the week ahead.</li>'}
        </ul>
      </div>
      <div class="vip-section">
        <h2>✨ Exclusive VIP Offers</h2>
        <p>As a VIP member, enjoy exclusive deals and early access to premium content. Check your dashboard for special offers!</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 GTrends Global. All rights reserved.</p>
      <p><a href="https://gtrendsglobal.com/unsubscribe">Unsubscribe from this newsletter</a></p>
    </div>
  </div>
</body>
</html>
    `;

    // Send emails to each subscriber
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      try {
        const mailClient = pb.newMailClient();
        await mailClient.send({
          from: {
            address: 'gtrendsglobal@horizons.hostinger.com',
            name: 'GTrends Global',
          },
          to: [{ address: subscriber.email }],
          subject: 'GTrends Weekly: Your Exclusive Market Insights',
          html: htmlTemplate,
        });
        sentCount++;
        logger.info(`📧 Newsletter sent to ${subscriber.email}`);
      } catch (error) {
        failedCount++;
        logger.error(`❌ Failed to send newsletter to ${subscriber.email}:`, error.message);
      }
    }

    // Track sent newsletters
    try {
      await pb.collection('newsletters_sent').create({
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
        status: 'sent',
        content_summary: 'Weekly newsletter with top jobs, blog post, and market insights',
      });
    } catch (error) {
      logger.warn('Could not create newsletters_sent record:', error.message);
    }

    logger.info(`✅ Newsletter sent to ${sentCount} subscribers (${failedCount} failed)`);
  } catch (error) {
    logger.error('❌ Weekly newsletter job failed:', error.message);
    throw error;
  }
}