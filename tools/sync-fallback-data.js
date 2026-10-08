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
  const blogPosts = posts.filter(p => p.category !== 'trendjacking');

  const content = `// Auto-synchronized fallback articles and blogs
export const fallbackArticles = ${JSON.stringify(trendjackingPosts.slice(0, 25), null, 2)};

export const fallbackBlogPosts = ${JSON.stringify(blogPosts.slice(0, 25), null, 2)};
`;

  fs.writeFileSync(fallbackFile, content, 'utf-8');
  console.log(`✅ Successfully updated fallbackData.js with latest ${trendjackingPosts.length} trendjacking articles!`);
} catch (err) {
  console.error('❌ Failed to sync fallback data:', err);
  process.exit(1);
}
