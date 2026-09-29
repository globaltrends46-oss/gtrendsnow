import { chromium } from 'playwright';
import path from 'path';

async function testArticleDetail() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Navigating to articles...');
  await page.goto('https://gtrendsnow.com/articles', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Clicking first article link...');
  const firstLink = page.locator('a:has-text("Read Full Article")').first();
  await firstLink.click();
  await page.waitForTimeout(2000);

  console.log('Article Detail URL:', page.url());
  const h1 = await page.locator('h1').innerText();
  console.log('H1 Title:', h1);

  const screenshotPath = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_article_detail.png');
  await page.screenshot({ path: screenshotPath });
  console.log('📸 Saved live_article_detail.png');

  await browser.close();
}

testArticleDetail().catch(console.error);
