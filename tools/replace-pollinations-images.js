import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const postsJsonPath = path.resolve(rootDir, 'apps/api/data/posts.json');

const replacementMap = {
  'post-1792252217193-zlqcv': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=960&q=80',
  'post-1792252153209-ni708': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=960&q=80',
  'post-1792252121815-4kj0w': 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=960&q=80',
  'post-1792252061078-s1pcu': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=960&q=80',
  'post-1791460098861-gmr4l': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=960&q=80',
  'post-1791460065853-a4kvx': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=960&q=80',
  'post-1791460024524-ep8an': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=960&q=80'
};

const categoryFallbacks = {
  sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=960&q=80',
  geopolitics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=960&q=80',
  energy: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=960&q=80',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=960&q=80',
  trendjacking: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=960&q=80'
};

if (fs.existsSync(postsJsonPath)) {
  const posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf-8'));
  let updatedCount = 0;

  for (const p of posts) {
    if (replacementMap[p.id]) {
      p.featured_image = replacementMap[p.id];
      updatedCount++;
    } else if (p.featured_image && p.featured_image.includes('pollinations.ai')) {
      const cat = p.category ? p.category.toLowerCase() : 'trendjacking';
      p.featured_image = categoryFallbacks[cat] || categoryFallbacks.trendjacking;
      updatedCount++;
    }
  }

  fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf-8');
  console.log(`✅ Replaced ${updatedCount} Pollinations images in posts.json with high-resolution editorial photography!`);
}
