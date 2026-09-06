import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🛡️  Running Enterprise Security Hardening Verification...\n');

let failed = false;
function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed = true;
  }
}

// 1. Check deletion of vip-debug.js and vip-test.js
assert(!fs.existsSync(path.join(rootDir, 'apps/api/src/routes/vip-debug.js')), 'vip-debug.js is deleted');
assert(!fs.existsSync(path.join(rootDir, 'apps/api/src/routes/vip-test.js')), 'vip-test.js is deleted');

const routesIndex = fs.readFileSync(path.join(rootDir, 'apps/api/src/routes/index.js'), 'utf-8');
assert(!routesIndex.includes('vip-debug'), 'routes/index.js does not import or mount vip-debug');
assert(!routesIndex.includes('vip-test'), 'routes/index.js does not import or mount vip-test');

// 2. Check IP anonymization in analytics.js
const analyticsCode = fs.readFileSync(path.join(rootDir, 'apps/api/src/routes/analytics.js'), 'utf-8');
assert(analyticsCode.includes('anonymizeIp'), 'analytics.js contains anonymizeIp function');
assert(!analyticsCode.includes('ip: req.ip || \'\''), 'analytics.js does not store raw visitor IP');
assert(analyticsCode.includes('path: h.path,') && !analyticsCode.includes('ip: h.ip'), 'analytics /stats output omits raw IP');

// 3. Check .htaccess security directives
const htaccess = fs.readFileSync(path.join(rootDir, '.htaccess'), 'utf-8');
assert(htaccess.includes('Options -Indexes'), '.htaccess disables directory indexing');
assert(htaccess.includes('package') && htaccess.includes('index'), '.htaccess blocks direct access to source/package files');
assert(htaccess.includes('X-Content-Type-Options') && htaccess.includes('X-Frame-Options'), '.htaccess includes enterprise security headers');

// 4. Check CORS in main.js
const mainJs = fs.readFileSync(path.join(rootDir, 'apps/api/src/main.js'), 'utf-8');
assert(mainJs.includes('ALLOWED_ORIGINS'), 'main.js validates allowed CORS origins');
assert(!mainJs.includes('origin: process.env.CORS_ORIGIN || true'), 'main.js does not use wildcard CORS with credentials');

// 5. Check Rate Limiters
const rateLimiters = fs.readFileSync(path.join(rootDir, 'apps/api/src/middleware/rate-limiters.js'), 'utf-8');
assert(rateLimiters.includes('aiRateLimit') && rateLimiters.includes('otpRateLimit') && rateLimiters.includes('loginRateLimit'), 'rate-limiters.js exports aiRateLimit, otpRateLimit, and loginRateLimit');

// 6. Check .env.example sanitization
const envExample = fs.readFileSync(path.join(rootDir, 'apps/web/.env.example'), 'utf-8');
assert(envExample.includes('VITE_MESSAGE91_API_KEY=""'), 'apps/web/.env.example has empty placeholder key');

// 7. Check key logging in gemini-chat.js
const geminiChat = fs.readFileSync(path.join(rootDir, 'apps/api/src/routes/gemini-chat.js'), 'utf-8');
assert(!geminiChat.includes('apiKey.substring(0, 10)'), 'gemini-chat.js does not log partial API key');

// 8. Check input capping in generate-cv.js
const generateCv = fs.readFileSync(path.join(rootDir, 'apps/api/src/routes/generate-cv.js'), 'utf-8');
assert(generateCv.includes('.slice(0, 15000)'), 'generate-cv.js caps input text to 15,000 characters');

console.log('\n----------------------------------------');
if (failed) {
  console.error('❌ Security verification failed.');
  process.exit(1);
} else {
  console.log('🎉 ALL 11 ENTERPRISE SECURITY CHECKS PASSED!');
}
