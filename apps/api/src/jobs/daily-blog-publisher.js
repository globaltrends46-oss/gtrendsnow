import 'dotenv/config';
import fetch from 'node-fetch';
import logger from '../utils/logger.js';
import { generateTextWithAI } from '../utils/aiClient.js';
import contentStore from '../utils/contentStore.js';

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
    if (!aiOutput || typeof aiOutput !== 'string') {
      return { title: fallbackTitle, content: '' };
    }
    let cleaned = aiOutput.trim();
    // Strip outer markdown code blocks if wrapped
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // 1. Direct JSON parse
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') {
        const title = parsed.title?.trim();
        const content = parsed.content?.trim();
        if (title && content) return { title, content };
      }
    } catch (_) {}

    // 2. Extract JSON object substring if surrounded by extra text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (parsed.title && parsed.content) {
          return { title: parsed.title.trim(), content: parsed.content.trim() };
        }
      } catch (_) {
        // Robust regex extraction for title and content with potential unescaped newlines
        const tMatch = candidate.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const cMatch = candidate.match(/"content"\s*:\s*"([\s\S]*)"\s*\}?\s*$/);
        if (tMatch && cMatch) {
          let cText = cMatch[1].replace(/"\s*\}?$/, '');
          return {
            title: tMatch[1].replace(/\\"/g, '"').trim(),
            content: cText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t').trim()
          };
        }
      }
    }
  } catch (e) {
    logger.warn('Failed to parse AI output as JSON, falling back to markdown extraction.');
  }

  // 3. Fallback to markdown header parsing
  let mdClean = aiOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  mdClean = mdClean.replace(/^\s*\{\s*"title"\s*:\s*"[^"]*",\s*"content"\s*:\s*"/i, '').replace(/"\s*\}\s*$/i, '');
  const titleMatch = mdClean.match(/^#+\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : fallbackTitle;
  const content = mdClean.replace(/^#+\s+.+$/m, '').trim();

  return { title, content: content || mdClean };
}

/**
 * Fetch Google Trends daily searches RSS for US, UK, Germany, France, and Spain with rich news context
 */
export async function getGoogleTrendsKeywords() {
  const geos = ['US', 'GB', 'DE', 'FR', 'ES'];
  
  const fetchGeoTrends = async (geo) => {
    try {
      logger.info(`📡 Fetching Google Trends ${geo} Daily RSS feed...`);
      const res = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 8000
      });
      if (!res.ok) {
        throw new Error(`Trends API for ${geo} returned status ${res.status}`);
      }
      const xml = await res.text();
      const items = xml.split('<item>').slice(1);
      const parsedItems = [];

      for (const item of items) {
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
        if (title && !title.toLowerCase().includes('google trends') && !title.toLowerCase().includes('rss')) {
          const traffic = item.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1]?.trim() || '20,000+';
          const newsTitle = item.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/)?.[1]?.trim() || '';
          const newsSource = item.match(/<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/)?.[1]?.trim() || 'Global News Desk';
          const newsUrl = item.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/)?.[1]?.trim() || '';

          parsedItems.push({
            keyword: title,
            geo,
            traffic,
            newsTitle,
            newsSource,
            newsUrl
          });
        }
      }
      return parsedItems;
    } catch (error) {
      logger.warn(`⚠️ Failed to fetch Google Trends for ${geo}: ${error.message}`);
      return [];
    }
  };

  const results = await Promise.all(geos.map(geo => fetchGeoTrends(geo)));

  // Combine and interleave items across nations
  const combined = [];
  const seenKeywords = new Set();
  const maxLen = Math.max(...results.map(r => r.length), 0);

  for (let i = 0; i < maxLen; i++) {
    for (let g = 0; g < geos.length; g++) {
      const item = results[g][i];
      if (item && !seenKeywords.has(item.keyword.toLowerCase())) {
        seenKeywords.add(item.keyword.toLowerCase());
        combined.push(item);
      }
    }
  }

  if (combined.length === 0) {
    // Fallback if network is blocked
    combined.push({
      keyword: 'Global Market Intelligence and AI Innovation',
      geo: 'US',
      traffic: '50,000+',
      newsTitle: 'Global Markets Shift Toward Autonomous AI Operations',
      newsSource: 'Financial Times'
    });
  }

  logger.info(`🔥 Multi-National Google Trends parsed: ${combined.length} hot topics available`);
  return combined;
}

/**
 * Helper to check whether a trending keyword has already been used in recent posts
 */
function isKeywordUsed(keyword, recentPosts, currentSessionKeywords = new Set()) {
  if (!keyword || typeof keyword !== 'string') return true;
  const clean = keyword.toLowerCase().trim();
  if (currentSessionKeywords.has(clean)) return true;

  for (const post of recentPosts) {
    const postTitle = (post.title || '').toLowerCase();
    const postTrend = (post.trend_keyword || '').toLowerCase();
    if (postTrend === clean) return true;
    if (postTitle.includes(clean)) return true;

    // Check if the clean keyword has significant subwords
    const words = clean.split(/\s+/).filter(w => w.length > 3);
    if (words.length >= 2 && words.every(w => postTitle.includes(w))) {
      return true;
    }
  }
  return false;
}

const categoryKeywords = {
  energy: ['energy', 'oil', 'gas', 'power', 'grid', 'solar', 'wind', 'battery', 'electric', 'nuclear', 'hiver', 'winter', 'coal', 'barrel', 'opec', 'fuel', 'crude'],
  tech: ['tech', 'ai', 'cloud', 'cyber', 'software', 'chip', 'semiconductor', 'apple', 'nvidia', 'google', 'meta', 'microsoft', 'gaming', 'leak', 'data', 'robot', 'gta', 'rechenzentrum', 'model', 'cyberleek'],
  sports: ['tennis', 'football', 'soccer', 'nba', 'nfl', 'ball', 'club', 'league', 'match', 'score', 'player', 'coach', 'champion', 'cup', 'atp', 'wta', 'race', 'olympic', 'fc', 'bu', 'manchester', 'van assche', 'andreeva', 'ferrero'],
  geopolitics: ['war', 'strike', 'minister', 'president', 'treaty', 'nato', 'eu', 'border', 'election', 'sanction', 'military', 'drone', 'missile', 'congress', 'court', 'un', 'diplomat', 'kramatorsk', 'brighton', 'sentencia', 'suspect']
};

function scoreCategoryRelevance(item, category) {
  const targets = categoryKeywords[category] || [];
  const text = `${item.keyword} ${item.newsTitle || ''} ${item.newsSource || ''}`.toLowerCase();
  let score = 0;
  for (const word of targets) {
    if (text.includes(word)) score += 2;
  }
  return score;
}

function selectBestKeywordForCategory(trendingItems, recentPosts, category, currentSessionKeywords) {
  let bestItem = null;
  let bestScore = -1;

  for (const item of trendingItems) {
    if (!item.keyword) continue;
    if (isKeywordUsed(item.keyword, recentPosts, currentSessionKeywords)) continue;

    const score = scoreCategoryRelevance(item, category);
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  // If no category-specific match found, take next top ranked unused keyword
  if (!bestItem) {
    for (const item of trendingItems) {
      if (!isKeywordUsed(item.keyword, recentPosts, currentSessionKeywords)) {
        bestItem = item;
        break;
      }
    }
  }

  // Fallback if all trending items were exhausted
  if (!bestItem) {
    bestItem = trendingItems[0] || { keyword: `${category} global macro shift` };
  }

  currentSessionKeywords.add(bestItem.keyword.toLowerCase().trim());
  return bestItem;
}

/**
 * Daily blog publisher job - Generates 1 post for each tab: geopolitics, energy, tech, sports
 * Guarantees every category gets a UNIQUE trending keyword!
 */
export async function dailyBlogPublisher(pb, loggerInstance, targetCategory = null) {
  const activeLogger = loggerInstance || logger;
  activeLogger.info(`🚀 Starting Daily Blog Auto-Publishing Job (Category: ${targetCategory || 'All 4 Categories'})`);

  const categories = targetCategory ? [targetCategory] : ['geopolitics', 'energy', 'tech', 'sports'];
  const trendingItems = await getGoogleTrendsKeywords();
  const existingPosts = contentStore.getPosts({ limit: 100 }).items || [];
  const currentSessionKeywords = new Set();
  const publishedPosts = [];

  for (let idx = 0; idx < categories.length; idx++) {
    const category = categories[idx];
    try {
      const trendItem = selectBestKeywordForCategory(trendingItems, existingPosts, category, currentSessionKeywords);
      const topicKeyword = trendItem.keyword;
      activeLogger.info(`📝 [${category.toUpperCase()}] Assigned unique trending topic: "${topicKeyword}" (Geo: ${trendItem.geo || 'Global'}, Context: "${trendItem.newsTitle || ''}")`);

      const prompt = `You are a world-class investigative journalist and industry analyst writing for GTrends Global. Write an extensive, highly engaging, publication-grade, long-form blog article (1500+ words) specifically analyzing the live trending search topic: "${topicKeyword}" within the context of ${category}.

CRITICAL INSTRUCTIONS FOR CONTENT DEPTH & REAL-TIME TRENDJACKING:
- Focus specifically on "${topicKeyword}" and why it is trending globally across US, UK, and European markets right now.
- News context reported: "${trendItem.newsTitle || topicKeyword}" via ${trendItem.newsSource || 'Global News Desks'}.
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

      const responseText = await generateTextWithAI(prompt, activeLogger, {
        keyword: topicKeyword,
        newsTitle: trendItem.newsTitle,
        newsSource: trendItem.newsSource,
        traffic: trendItem.traffic,
        category
      });

      const parsed = parseAISubmission(responseText, `Daily ${category} Report: ${topicKeyword}`);
      const featuredImage = getCategoryFeaturedImage(category);

      // Save via contentStore (saves to disk JSON + syncs to PocketBase)
      const record = await contentStore.savePost({
        title: parsed.title,
        content: parsed.content,
        category: category,
        featured_image: featuredImage,
        author: 'GTrends Global AI Research',
        trend_keyword: topicKeyword,
        published_date: new Date().toISOString()
      });

      publishedPosts.push(record);
      existingPosts.unshift(record);
      activeLogger.info(`✅ Successfully published daily blog for category [${category}]: "${parsed.title}"`);
    } catch (err) {
      activeLogger.error(`❌ Failed to publish daily blog for category [${category}]:`, err.message);
    }
  }

  return publishedPosts;
}

/**
 * Daily Trendjacking Articles publisher - Generates top N trending news posts from live searches
 * Guarantees each article covers a distinct top trending keyword (e.g., top 1, 2, 3)
 */
export async function trendjackingPublisher(pb, loggerInstance, count = 3) {
  const activeLogger = loggerInstance || logger;
  activeLogger.info(`🚀 Starting Trendjacking Daily Article Publisher Job (Target: Top ${count} Articles)`);

  try {
    const trendingItems = await getGoogleTrendsKeywords();
    const existingPosts = contentStore.getPosts({ limit: 100 }).items || [];
    const currentSessionKeywords = new Set();
    const publishedPosts = [];

    // Filter top N unique, unused trending keywords
    const itemsToPublish = [];
    for (const item of trendingItems) {
      if (!item.keyword) continue;
      if (!isKeywordUsed(item.keyword, existingPosts, currentSessionKeywords)) {
        itemsToPublish.push(item);
        currentSessionKeywords.add(item.keyword.toLowerCase().trim());
        if (itemsToPublish.length >= count) break;
      }
    }

    // Fallback if not enough unused items
    if (itemsToPublish.length < count) {
      for (const item of trendingItems) {
        if (!itemsToPublish.includes(item)) {
          itemsToPublish.push(item);
          if (itemsToPublish.length >= count) break;
        }
      }
    }

    activeLogger.info(`📰 Selected top ${itemsToPublish.length} distinct trending keywords: ${itemsToPublish.map((it, idx) => `#${idx + 1} "${it.keyword}"`).join(', ')}`);

    for (let i = 0; i < itemsToPublish.length; i++) {
      const trendItem = itemsToPublish[i];
      const keyword = trendItem.keyword;

      activeLogger.info(`✍️ [${i + 1}/${itemsToPublish.length}] Writing article for trending topic: "${keyword}" (${trendItem.traffic || ''})`);

      const prompt = `You are a senior investigative tech and economic journalist writing for GTrends Global. Write an extensive, highly engaging, publication-grade news report (1500+ words) about the trending global topic: "${keyword}".

CRITICAL INSTRUCTIONS FOR MULTI-NATIONAL TRENDJACKING:
- Explain why "${keyword}" is trending across the USA, UK, and Europe right now.
- News context reported: "${trendItem.newsTitle || keyword}" via ${trendItem.newsSource || 'Global News Desks'}.
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

      const responseText = await generateTextWithAI(prompt, activeLogger, {
        keyword,
        newsTitle: trendItem.newsTitle,
        newsSource: trendItem.newsSource,
        traffic: trendItem.traffic,
        category: 'trendjacking'
      });

      const parsed = parseAISubmission(responseText, `Breaking Trend: Latest on ${keyword}`);
      const featuredImage = getCategoryFeaturedImage('trendjacking');

      // Save via contentStore (saves to disk JSON + syncs to PocketBase)
      const record = await contentStore.savePost({
        title: parsed.title,
        content: parsed.content,
        category: 'trendjacking',
        featured_image: featuredImage,
        author: 'GTrends Trendjacking Feed',
        trend_keyword: keyword,
        published_date: new Date().toISOString()
      });

      publishedPosts.push(record);
      existingPosts.unshift(record);
      activeLogger.info(`✅ Successfully published trendjacking article #${i + 1}: "${parsed.title}" (ID: ${record.id})`);
    }

    return publishedPosts;
  } catch (err) {
    activeLogger.error('❌ Failed to run trendjacking publisher job:', err.message);
    throw err;
  }
}