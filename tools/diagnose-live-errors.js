import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('requestfailed', req => {
    networkErrors.push(`FAILED: ${req.method()} ${req.url()} (${req.failure()?.errorText})`);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      networkErrors.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  console.log('--- 1. Testing Homepage ---');
  await page.goto('https://gtrendsnow.com', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('--- 2. Testing Articles Page ---');
  await page.goto('https://gtrendsnow.com/articles', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('--- 3. Testing Blog Page ---');
  await page.goto('https://gtrendsnow.com/blog', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('--- 4. Testing MCP Page ---');
  await page.goto('https://gtrendsnow.com/mcp', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('\n=== Network Errors Encountered ===');
  networkErrors.forEach(e => console.log('  ', e));

  console.log('\n=== Browser Console Logs ===');
  consoleLogs.forEach(l => console.log('  ', l));

  await browser.close();
}

diagnose().catch(console.error);
