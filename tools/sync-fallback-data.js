import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const postsFile = path.resolve(rootDir, 'apps/api/data/posts.json');
const fallbackFile = path.resolve(rootDir, 'apps/web/src/lib/fallbackData.js');

try {
  const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
  console.log(`Loaded ${posts.length} posts from posts.json`);

  const trendjackingPosts = posts.filter(p => p.category === 'trendjacking');

  const categorizedBlogs = {
    geopolitics: posts.filter(p => p.category === 'geopolitics' || (!p.category && !['trendjacking', 'energy', 'tech', 'sports'].includes(p.category))).slice(0, 25),
    energy: posts.filter(p => p.category === 'energy').slice(0, 25),
    tech: posts.filter(p => p.category === 'tech').slice(0, 25),
    sports: posts.filter(p => p.category === 'sports').slice(0, 25)
  };

  const allBlogPosts = [
    ...categorizedBlogs.geopolitics,
    ...categorizedBlogs.energy,
    ...categorizedBlogs.tech,
    ...categorizedBlogs.sports
  ];

  const content = `// Auto-synchronized fallback articles and blogs
export const fallbackArticles = ${JSON.stringify(trendjackingPosts.slice(0, 30), null, 2)};

export const fallbackBlogPosts = ${JSON.stringify(categorizedBlogs, null, 2)};

export const allFallbackBlogPosts = ${JSON.stringify(allBlogPosts, null, 2)};
`;

  fs.writeFileSync(fallbackFile, content, 'utf-8');
  console.log(`✅ Successfully updated fallbackData.js with categorized blog posts and ${trendjackingPosts.length} trendjacking articles!`);
} catch (err) {
  console.error('❌ Failed to sync fallback data:', err);
  process.exit(1);
}
