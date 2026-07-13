import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('📦 Running deployment copy script...');

const itemsToCopy = [
  { src: 'apps/api', dest: 'apps/api', filter: (src) => !src.includes('node_modules') },
  { src: 'apps/pocketbase', dest: 'apps/pocketbase', filter: (src) => !src.includes('pb_data') && !src.includes('pb_backups') },
  { src: 'index.js', dest: 'index.js' },
  { src: 'package.json', dest: 'package.json' },
  { src: 'node_modules', dest: 'node_modules' }
];

try {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  for (const item of itemsToCopy) {
    const srcPath = path.resolve(rootDir, item.src);
    const destPath = path.resolve(distDir, item.dest);

    if (fs.existsSync(srcPath)) {
      console.log(`🚚 Copying ${item.src} -> dist/${item.dest}`);
      
      // Ensure parent directory of destination exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      
      fs.cpSync(srcPath, destPath, {
        recursive: true,
        force: true,
        dereference: true,
        filter: item.filter || (() => true)
      });
    } else {
      console.warn(`⚠️ Source path not found: ${srcPath}`);
    }
  }

  console.log('🎉 All backend deployment assets copied to dist/ directory successfully!');
} catch (err) {
  console.error('❌ Failed to copy backend deployment assets:', err.message);
  process.exit(1);
}
