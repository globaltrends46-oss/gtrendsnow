import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Unified Production Entry Point (index.js)...');

// 1. Verify/Set execution rights for PocketBase binary
try {
  const pbPath = path.resolve(__dirname, 'apps/pocketbase/pocketbase');
  if (fs.existsSync(pbPath)) {
    fs.chmodSync(pbPath, '755');
    console.log('✅ PocketBase execution permissions set');
  }
} catch (err) {
  console.error('⚠️ Failed to chmod pocketbase:', err.message);
}

// 2. Start PocketBase process
console.log('📦 Launching PocketBase database server...');
const pbProcess = spawn('./pocketbase', [
  'serve',
  '--http=127.0.0.1:8090',
  '--dir=./pb_data',
  '--migrationsDir=./pb_migrations',
  '--hooksDir=./pb_hooks',
  '--hooksWatch=false'
], {
  cwd: path.resolve(__dirname, 'apps/pocketbase'),
  stdio: 'inherit',
  shell: true
});

pbProcess.on('error', (err) => {
  console.error('❌ Failed to start PocketBase process:', err);
});

pbProcess.on('exit', (code) => {
  console.log(`⚠️ PocketBase process exited with code ${code}`);
});

// 3. Start the Express API Server
console.log('⚡ Launching API Server...');
import('./apps/api/src/main.js').then(() => {
  console.log('✅ Express API module loaded successfully');
}).catch(err => {
  console.error('❌ Failed to load Express API module:', err);
  process.exit(1);
});
