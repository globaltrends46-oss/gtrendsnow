import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Synchronizing articles and blog posts to September 29, 2026...');

// 1. Process apps/api/data/posts.json
const postsPath = path.resolve(rootDir, 'apps/api/data/posts.json');
if (fs.existsSync(postsPath)) {
  let posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  
  // Filter out any broken SSE stream artifacts
  posts = posts.filter(p => !p.content?.includes('data: {"id":"chatcmpl'));

  // Update dates of recent posts to Sept 29, 2026
  const baseTime = new Date('2026-09-29T08:00:00.000Z').getTime();
  posts.slice(0, 10).forEach((p, idx) => {
    const postTime = new Date(baseTime - idx * 30 * 60 * 1000).toISOString();
    p.published_date = postTime;
    p.created = postTime;
  });

  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf-8');
  console.log('✅ Updated apps/api/data/posts.json with Sept 29, 2026 dates');
}

// 2. Process apps/web/src/lib/fallbackData.js
const fallbackPath = path.resolve(rootDir, 'apps/web/src/lib/fallbackData.js');
if (fs.existsSync(fallbackPath)) {
  let content = fs.readFileSync(fallbackPath, 'utf-8');
  
  // Replace 2026-09-22T... or 2026-09-06T... with 2026-09-29T...
  content = content.replace(/2026-09-22T17:33:45\.953Z/g, '2026-09-29T08:00:00.000Z');
  content = content.replace(/2026-09-22T17:33:14\.010Z/g, '2026-09-29T07:45:00.000Z');
  content = content.replace(/2026-09-22T17:32:42\.046Z/g, '2026-09-29T07:30:00.000Z');
  content = content.replace(/2026-09-22T17:32:12\.434Z/g, '2026-09-29T07:15:00.000Z');
  content = content.replace(/2026-09-22T17:31:37\.026Z/g, '2026-09-29T07:00:00.000Z');
  content = content.replace(/2026-09-22T17:30:00\.000Z/g, '2026-09-29T06:45:00.000Z');
  
  // Replace older Sept 6 dates on featured posts
  content = content.replace(/2026-09-06T05:59:40\.520Z/g, '2026-09-29T05:30:00.000Z');
  content = content.replace(/2026-09-06T05:59:40\.498Z/g, '2026-09-29T05:15:00.000Z');
  content = content.replace(/2026-09-06T05:59:40\.481Z/g, '2026-09-29T05:00:00.000Z');
  content = content.replace(/2026-09-06T05:59:40\.460Z/g, '2026-09-29T04:45:00.000Z');

  // Replace August dates on active cards
  content = content.replace(/2026-08-06T07:11:21\.172Z/g, '2026-09-29T04:30:00.000Z');
  content = content.replace(/2026-08-05T07:11:21\.173Z/g, '2026-09-29T04:15:00.000Z');
  content = content.replace(/2026-08-04T07:11:21\.173Z/g, '2026-09-29T04:00:00.000Z');
  content = content.replace(/2026-08-03T07:11:21\.173Z/g, '2026-09-29T03:45:00.000Z');
  content = content.replace(/2026-08-02T07:11:21\.173Z/g, '2026-09-29T03:30:00.000Z');
  content = content.replace(/2026-08-01T07:11:21\.173Z/g, '2026-09-29T03:15:00.000Z');

  fs.writeFileSync(fallbackPath, content, 'utf-8');
  console.log('✅ Updated apps/web/src/lib/fallbackData.js with Sept 29, 2026 dates');
}

console.log('🎉 Date synchronization complete!');
