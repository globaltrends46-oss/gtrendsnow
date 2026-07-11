import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import logger from '../utils/logger.js';

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
  const content = aiOutput.replace(/^#+\s+.+$/m, '').trim(); // Remove the title line

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
 * Task 1: Fetch Google Trends daily searches RSS and parse trending keywords
 */
export async function getGoogleTrendsKeywords() {
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
      const items = xml.split('<item>');
      const keywords = [];
      for (let i = 1; i < items.length; i++) {
        const titleMatch = items[i].match(/<title>([\s\S]*?)<\/title>/);
        if (titleMatch) {
          keywords.push(titleMatch[1].trim());
        }
      }
      return keywords;
    } catch (error) {
      logger.error(`❌ Failed to fetch Google Trends keywords for ${geo}:`, error.message);
      return [];
    }
  };

  const [usKeywords, ukKeywords] = await Promise.all([
    fetchGeoKeywords('US'),
    fetchGeoKeywords('GB')
  ]);

  // Combine and interleave keywords, avoiding duplicates
  const combined = [];
  const maxLen = Math.max(usKeywords.length, ukKeywords.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < usKeywords.length && !combined.includes(usKeywords[i])) {
      combined.push(usKeywords[i]);
    }
    if (i < ukKeywords.length && !combined.includes(ukKeywords[i])) {
      combined.push(ukKeywords[i]);
    }
  }

  logger.info(`🔥 Combined US/UK Trends keywords (Top 5): ${combined.slice(0, 5).join(', ')}`);
  return combined;
}

/**
 * Daily blog publisher job - Generates 1 post for each tab: geopolitics, energy, tech, sports
 */
export async function dailyBlogPublisher(pb, loggerInstance, targetCategory = null) {
  const activeLogger = loggerInstance || logger;
  activeLogger.info(`🚀 Starting Daily Blog Auto-Publishing Job (Category: ${targetCategory || 'All'})`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    activeLogger.error('❌ GEMINI_API_KEY environment variable is not set. Daily Blog Job aborted.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const categories = targetCategory ? [targetCategory] : ['geopolitics', 'energy', 'tech', 'sports'];

  for (const category of categories) {
    try {
      activeLogger.info(`📝 Generating blog post for category: ${category}`);

      const prompt = `Generate a comprehensive, SEO-optimized, highly engaging blog article (1500+ words) about the latest developments and trends in ${category}.
Include data points, expert analysis, and actionable insights.
Return the result in JSON format only, structured exactly like:
{
  "title": "A compelling title about ${category}",
  "content": "Full detailed article body in clean markdown formatting, with sections, bullet points and detailed analysis."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = parseAISubmission(responseText, `Daily ${category} Intelligence Digest`);

      const featuredImage = getCategoryFeaturedImage(category);

      const record = await pb.collection('blog_posts').create({
        title: parsed.title,
        content: parsed.content,
        category: category,
        featured_image: featuredImage,
        author: 'GTrends Global AI Research',
        status: 'published',
        published_date: new Date().toISOString()
      });

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    activeLogger.error('❌ GEMINI_API_KEY environment variable is not set. Trendjacking Job aborted.');
    return;
  }

  try {
    const keywords = await getGoogleTrendsKeywords();
    if (keywords.length === 0) {
      activeLogger.warn('⚠️ Google Trends returned 0 keywords. Falling back to hot macro topics.');
      keywords.push('Global Economic Outlook and Markets');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Select the single most trending keyword
    const keyword = keywords[0];
    activeLogger.info(`📰 Selected trending keyword: "${keyword}"`);

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
      activeLogger.info(`🔄 Keyword "${keyword}" is the same as the last article. Instructing AI to write a different follow-up article.`);
      prompt = `Generate a modern, highly engaging, and SEO-optimized news article (1500+ words) about the trending global topic: "${keyword}".
This topic has been trending all day, and we already published an initial report. Therefore, write a completely DIFFERENT follow-up article on "${keyword}". Focus on subsequent developments, public reaction, deeper analytical insights, and market/political sentiment. Do not repeat the same overview structure as the initial report.
Return the result in JSON format only, structured exactly like:
{
  "title": "A catchy, follow-up news headline about ${keyword}",
  "content": "Detailed article content in clean markdown formatting, structured as a news report with clear subheadings, analytical deep-dives, and bullet points."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;
    } else {
      prompt = `Generate a modern, highly engaging, and SEO-optimized news article (1500+ words) about the trending global topic: "${keyword}".
Focus on explaining why it is trending, what is happening right now, key facts, public/market sentiments, and its future implications.
Return the result in JSON format only, structured exactly like:
{
  "title": "A catchy, trendjacking news headline about ${keyword}",
  "content": "Detailed article content in clean markdown formatting, structured as a news report with clear subheadings, comprehensive paragraphs, and bullet points."
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
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
    });

    // Enforce the 20 articles limit for trendjacking
    await enforcePostLimit(pb, 'trendjacking', activeLogger);

    activeLogger.info(`✅ Successfully published trendjacking article: "${parsed.title}" (ID: ${record.id})`);
  } catch (err) {
    activeLogger.error('❌ Failed to run trendjacking publisher job:', err.message);
  }
}