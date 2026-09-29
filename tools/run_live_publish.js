import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dailyBlogPublisher, trendjackingPublisher, getGoogleTrendsKeywords } from '../apps/api/src/jobs/daily-blog-publisher.js';
import contentStore from '../apps/api/src/utils/contentStore.js';
import logger from '../apps/api/src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DATA_PATH = path.resolve(__dirname, '../apps/web/src/lib/fallbackData.js');

async function main() {
  console.log('====================================================');
  console.log('🔥 STARTING LIVE TRENDING POSTING VIA OMNIROUTE 🔥');
  console.log('====================================================\n');

  // 1. Fetch live trending keywords
  const trends = await getGoogleTrendsKeywords();
  console.log(`📡 Retrieved ${trends.length} active trending search topics across US/UK/EU:`);
  trends.slice(0, 5).forEach((t, i) => {
    console.log(`   ${i + 1}. [${t.geo}] "${t.keyword}" (${t.traffic}) - Context: ${t.newsTitle || 'N/A'}`);
  });

  const categories = ['tech', 'energy', 'geopolitics', 'sports'];
  const allPublished = [];

  // 2. Generate and publish for each category
  for (const cat of categories) {
    console.log(`\n----------------------------------------------------`);
    console.log(`📝 Generating and publishing post for: [${cat.toUpperCase()}]`);
    console.log(`----------------------------------------------------`);
    try {
      const results = await dailyBlogPublisher(null, logger, cat);
      if (results && results.length > 0) {
        allPublished.push(...results);
        console.log(`✅ [${cat}] Published: "${results[0].title}" (ID: ${results[0].id})`);
      }
    } catch (err) {
      console.error(`❌ [${cat}] Error:`, err.message);
    }
  }

  // 3. Generate and publish trendjacking article on #1 trending topic
  console.log(`\n----------------------------------------------------`);
  console.log(`🔥 Generating and publishing #1 TRENDJACKING News Post`);
  console.log(`----------------------------------------------------`);
  try {
    const tjPost = await trendjackingPublisher(null, logger);
    if (tjPost) {
      allPublished.push(tjPost);
      console.log(`✅ [TRENDJACKING] Published: "${tjPost.title}" (ID: ${tjPost.id})`);
    }
  } catch (err) {
    console.error(`❌ [TRENDJACKING] Error:`, err.message);
  }

  // 4. Sync newest posts to fallbackData.js for immediate frontend display
  console.log('\n----------------------------------------------------');
  console.log('🔄 Syncing newly generated posts to apps/web/src/lib/fallbackData.js...');
  try {
    const postsJsonPath = path.resolve(__dirname, '../apps/api/data/posts.json');
    if (fs.existsSync(postsJsonPath)) {
      const allPosts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));
      console.log(`💾 Total posts in content store: ${allPosts.length}`);

      // Map to fallbackArticles
      const fallbackArticles = allPosts.slice(0, 20).map(p => ({
        id: p.id,
        title: p.title,
        hookDescription: p.hookDescription || (p.content ? p.content.substring(0, 160).replace(/[#*]/g, '').trim() + '...' : ''),
        featured_image: p.featured_image,
        author: p.author || 'GTrends Intelligence',
        published_date: p.published_date || new Date().toISOString(),
        content: p.content
      }));

      // Group by category for fallbackBlogPosts
      const fallbackBlogPosts = {
        geopolitics: [],
        energy: [],
        tech: [],
        sports: []
      };

      for (const p of allPosts) {
        const cat = p.category ? p.category.toLowerCase() : 'tech';
        if (fallbackBlogPosts[cat] && fallbackBlogPosts[cat].length < 20) {
          fallbackBlogPosts[cat].push({
            id: p.id,
            title: p.title,
            description: p.hookDescription || (p.content ? p.content.substring(0, 160).replace(/[#*]/g, '').trim() + '...' : ''),
            urlToImage: p.featured_image,
            source: { name: `GTrends ${cat.charAt(0).toUpperCase() + cat.slice(1)}` },
            publishedAt: p.published_date || new Date().toISOString(),
            link: `/blog/${p.id}`,
            content: p.content
          });
        }
      }

      const jsContent = `export const fallbackArticles = ${JSON.stringify(fallbackArticles, null, 2)};\n\nexport const fallbackBlogPosts = ${JSON.stringify(fallbackBlogPosts, null, 2)};\n`;
      fs.writeFileSync(FALLBACK_DATA_PATH, jsContent, 'utf-8');
      console.log('✅ Successfully updated fallbackData.js with new live trending posts!');
    }
  } catch (syncErr) {
    console.warn('⚠️ Could not sync to fallbackData.js:', syncErr.message);
  }

  console.log('\n====================================================');
  console.log(`🎉 COMPLETED: ${allPublished.length} articles and blogs successfully published!`);
  console.log('====================================================');
}

main().catch(console.error);
