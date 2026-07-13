import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'debug.log');

function logToFile(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
}

logToFile('🚀 Starting Unified Production Entry Point (index.js)...');

// 1. Verify/Set execution rights for PocketBase binary
try {
  const pbPath = path.resolve(__dirname, 'apps/pocketbase/pocketbase');
  if (fs.existsSync(pbPath)) {
    fs.chmodSync(pbPath, '755');
    logToFile('✅ PocketBase execution permissions set');
  } else {
    logToFile('⚠️ PocketBase binary NOT found at: ' + pbPath);
  }
} catch (err) {
  logToFile('⚠️ Failed to chmod pocketbase: ' + err.message);
}

// 2. Start PocketBase process
logToFile('📦 Launching PocketBase database server...');
const pbProcess = spawn('./pocketbase', [
  'serve',
  '--http=127.0.0.1:8090',
  '--dir=./pb_data',
  '--migrationsDir=./pb_migrations',
  '--hooksDir=./pb_hooks',
  '--hooksWatch=false'
], {
  cwd: path.resolve(__dirname, 'apps/pocketbase'),
  stdio: 'ignore',
  detached: true
});

pbProcess.unref();

pbProcess.on('error', (err) => {
  logToFile('❌ Failed to start PocketBase process: ' + err.message);
});

// 3. Start the Express API Server
logToFile('⚡ Importing main.js (Express API server)...');
import('./apps/api/src/main.js')
  .then(() => {
    logToFile('✅ main.js loaded successfully!');
  })
  .catch((err) => {
    logToFile('❌ Failed to load main.js: ' + err.message + '\n' + err.stack);
  });
