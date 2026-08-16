import 'dotenv/config';
import fetch from 'node-fetch';
import logger from '../utils/logger.js';
import { generateTextWithAI } from '../utils/aiClient.js';

// Predefined high-quality Unsplash stock images for each category to ensure visual excellence
const categoryImages = {
  geopolitics: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
  ],
  energy: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590102421318-758b234479e0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80'
  ],
  tech: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80'
  ],
  trendjacking: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  ]
};

const getCategoryFeaturedImage = (category) => {
  const list = categoryImages[category.toLowerCase()] || categoryImages.tech;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};

/**
 * Clean and format generated blog text to extract title and body
 */
function parseAISubmission(aiOutput, fallbackTitle) {
  try {
    const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.title && data.content) {
        return { title: data.title.trim(), content: data.content.trim() };
      }
    }
  } catch (e) {
    logger.warn('Failed to parse AI output as JSON, falling back to markdown extraction.');
  }

  // Parse title from markdown title tag (# Heading)
  const titleMatch = aiOutput.match(/^#+\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : fallbackTitle;
  const content = aiOutput.replace(/^#+\s+.+$/m, '').trim();

  return { title, content };
}

/**
 * Keeps only the latest 20 articles in the database for a specific category, deleting the oldest ones.
 */
async function enforcePostLimit(pb, category, activeLogger) {
  try {
    const existingPosts = await pb.collection('blog_posts').getFullList({
      filter: `category = "${category}"`,
      sort: '-published_date',
      $autoCancel: false
    });

    if (existingPosts.length > 20) {
      activeLogger.info(`🧹 Category "${category}" has ${existingPosts.length} posts. Enforcing 20 post limit...`);
      const postsToDelete = existingPosts.slice(20);
      for (const post of postsToDelete) {
        await pb.collection('blog_posts').delete(post.id, { $autoCancel: false });
        activeLogger.info(`🗑️ Deleted old post: "${post.title}" (ID: ${post.id})`);
      }
    }
  } catch (err) {
    activeLogger.warn(`⚠️ Failed to enforce post limit for category [${category}]:`, err.message);
  }
}

/**
 * Fetch Google Trends daily searches RSS for US, UK, Germany, France, and Spain
 */
export async function getGoogleTrendsKeywords() {
  const geos = ['US', 'GB', 'DE', 'FR', 'ES'];
  
  const fetchGeoKeywords = async (geo) => {
    try {
      logger.info(`📡 Fetching Google Trends ${geo} Daily RSS feed...`);
      const res = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) {
        throw new Error(`Trends API for ${geo} returned status ${res.status}`);
      }
      const xml = await res.text();
      const matches = [...xml.matchAll(/<title>([\s\S]*?)<\/title>/g)].map(m => m[1]);
      return matches.slice(1).map(k => k.trim()).filter(Boolean);
    } catch (error) {
      logger.error(`❌ Failed to fetch Google Trends keywords for ${geo}:`, error.message);
      return [];
    }
  };

  const results = await Promise.all(geos.map(geo => fetchGeoKeywords(geo)));

  // Combine and interleave keywords across nations
  const combined = [];
  const maxLen = Math.max(...results.map(r => r.length));
  for (let i = 0; i < maxLen; i++) {
    for (let g = 0; g < geos.length; g++) {
      const keyword = results[g][i];
      if (keyword && !combined.includes(keyword) && !keyword.toLowerCase().includes('rss') && !keyword.toLowerCase().includes('google trends')) {
        combined.push(keyword);
      }
    }
  }

  logger.info(`🔥 Multi-National (US/UK/EU) Google Trends keywords (Top 5): ${combined.slice(0, 5).join(', ')}`);
  return combined;
}

/**
 * Daily blog publisher job - Generates 1 post for each tab: geopolitics, energy, tech, sports
 * Now uses LIVE multi-national Google Trends search terms for true trendjacking!
 */
export async function dailyBlogPublisher(pb, loggerInstance, targetCategory = null) {
  const activeLogger = loggerInstance || logger;
  activeLogger.info(`🚀 Starting Daily Blog Auto-Publishing Job (Category: ${targetCategory || 'All'})`);

  const categories = targetCategory ? [targetCategory] : ['geopolitics', 'energy', 'tech', 'sports'];
  const trendingKeywords = await getGoogleTrendsKeywords();

  for (let idx = 0; idx < categories.length; idx++) {
    const category = categories[idx];
    try {
      const topicKeyword = trendingKeywords[idx % trendingKeywords.length] || `${category} market trends`;
      activeLogger.info(`📝 Generating blog post for category [${category}] on live trending topic: "${topicKeyword}"`);

      const prompt = `You are a world-class investigative journalist and industry analyst writing for GTrends Global. Write an extensive, highly engaging, publication-grade, long-form blog article (1500+ words) specifically analyzing the live trending search topic: "${topicKeyword}" within the context of ${category}.

CRITICAL INSTRUCTIONS FOR CONTENT DEPTH & REAL-TIME TRENDJACKING:
- Focus specifically on "${topicKeyword}" and why it is trending globally across US, UK, and European markets right now.
- Write comprehensive, multi-paragraph deep-dives under each heading. DO NOT write single-line summaries.
- Structure with clear Markdown H2 (##) and H3 (###) section headers.
- Include specific quantitative data points, percentage metrics, market projections, and real-world enterprise case studies.
- Include bulleted analytical breakdowns and actionable executive takeaways.

Return the result in JSON format only, structured exactly like:
{
  "title": "A high-CTR, compelling headline about ${topicKeyword}",
  "content": "Full detailed article body in clean markdown formatting with multi-paragraph sections, bullet points, data tables, and deep analysis."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;

      const responseText = await generateTextWithAI(prompt, activeLogger);
      const parsed = parseAISubmission(responseText, `Daily ${category} Report: ${topicKeyword}`);

      const featuredImage = getCategoryFeaturedImage(category);

      const record = await pb.collection('blog_posts').create({
        title: parsed.title,
        content: parsed.content,
        category: category,
        featured_image: featuredImage,
        author: 'GTrends Global AI Research',
        status: 'published',
        published_date: new Date().toISOString()
      }, { $autoCancel: false });

      // Enforce the 20 articles limit per category
      await enforcePostLimit(pb, category, activeLogger);

      activeLogger.info(`✅ Successfully published daily blog for category [${category}]: "${parsed.title}" (ID: ${record.id})`);
    } catch (err) {
      activeLogger.error(`❌ Failed to publish daily blog for category [${category}]:`, err.message);
    }
  }
}

/**
 * Daily Trendjacking Articles publisher - Generates 2 trending news posts daily
 */
export async function trendjackingPublisher(pb, loggerInstance) {
  const activeLogger = loggerInstance || logger;
  activeLogger.info('🚀 Starting Trendjacking Daily Article Publisher Job');

  try {
    const keywords = await getGoogleTrendsKeywords();
    if (keywords.length === 0) {
      activeLogger.warn('⚠️ Google Trends returned 0 keywords. Falling back to hot macro topics.');
      keywords.push('Global Economic Outlook and Markets');
    }

    // Select the #1 most trending keyword across US, UK & Europe
    const keyword = keywords[0];
    activeLogger.info(`📰 Selected #1 trending keyword across US/UK/EU: "${keyword}"`);

    // Check the last published trendjacking article
    let lastArticle = null;
    try {
      const records = await pb.collection('blog_posts').getList(1, 1, {
        filter: 'category = "trendjacking"',
        sort: '-published_date',
        $autoCancel: false
      });
      if (records.items.length > 0) {
        lastArticle = records.items[0];
      }
    } catch (e) {
      activeLogger.warn('No previous trendjacking articles found to check duplicate keywords.');
    }

    const isSameKeyword = lastArticle && lastArticle.title.toLowerCase().includes(keyword.toLowerCase());
    
    let prompt;
    if (isSameKeyword) {
      activeLogger.info(`🔄 Keyword "${keyword}" matches last article. Instructing AI to write a follow-up breaking analysis.`);
      prompt = `You are a senior investigative tech and economic journalist writing for GTrends Global. Write an extensive, highly engaging, publication-grade news report (1500+ words) on the trending topic: "${keyword}".
This topic is currently trending #1 across the USA, UK, and Europe. Write a completely DIFFERENT follow-up report on "${keyword}". Focus on subsequent developments, market reaction, public sentiment, and global implications.
Return the result in JSON format only, structured exactly like:
{
  "title": "A high-CTR news headline about ${keyword}",
  "content": "Detailed article content in clean markdown formatting with subheadings, analytical deep-dives, and bullet points."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;
    } else {
      prompt = `You are a senior investigative tech and economic journalist writing for GTrends Global. Write an extensive, highly engaging, publication-grade news report (1500+ words) about the #1 trending global topic: "${keyword}".

CRITICAL INSTRUCTIONS FOR MULTI-NATIONAL TRENDJACKING:
- Explain why "${keyword}" is trending #1 across the USA, UK, and Europe right now.
- Write comprehensive, multi-paragraph deep-dives under each heading.
- Focus on key background facts, market/public sentiment, and future strategic implications.
- Structure with clear Markdown H2 (##) and H3 (###) section headers.
- Include specific quantitative data points, percentage metrics, and expert analysis.

Return the result in JSON format only, structured exactly like:
{
  "title": "A high-CTR, compelling news headline about ${keyword}",
  "content": "Detailed article content in clean markdown formatting with subheadings, comprehensive multi-paragraph sections, and bullet points."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;
    }

    const responseText = await generateTextWithAI(prompt, activeLogger);
    const parsed = parseAISubmission(responseText, `Breaking Trend: Latest on ${keyword}`);

    const featuredImage = getCategoryFeaturedImage('trendjacking');

    const record = await pb.collection('blog_posts').create({
      title: parsed.title,
      content: parsed.content,
      category: 'trendjacking',
      featured_image: featuredImage,
      author: 'GTrends Trendjacking Feed',
      status: 'published',
      published_date: new Date().toISOString()
    }, { $autoCancel: false });

    // Enforce the 20 articles limit for trendjacking
    await enforcePostLimit(pb, 'trendjacking', activeLogger);

    activeLogger.info(`✅ Successfully published trendjacking article: "${parsed.title}" (ID: ${record.id})`);
  } catch (err) {
    activeLogger.error('❌ Failed to run trendjacking publisher job:', err.message);
  }
}