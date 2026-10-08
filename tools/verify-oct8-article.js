import { chromium } from 'playwright';
import path from 'path';

async function checkArticles() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Navigating to https://gtrendsnow.com/articles...');
  await page.goto('https://gtrendsnow.com/articles', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const titles = await page.locator('article h2, article h3, div.grid h2, div.grid h3').allInnerTexts();
  console.log('Article titles visible:', titles.slice(0, 5));

  const dates = await page.locator('article, div.grid > div').allInnerTexts();
  console.log('Sample text snippets from cards:', dates.slice(0, 2).map(t => t.replace(/\n/g, ' | ').slice(0, 150)));

  const screenshotPath = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_articles_oct8.png');
  await page.screenshot({ path: screenshotPath });
  console.log('📸 Saved live_articles_oct8.png');

  // Click first article to test article detail view
  console.log('Testing article detail click...');
  const firstLink = page.locator('a[href*="/articles/"]').first();
  if (await firstLink.count() > 0) {
    await firstLink.click();
    await page.waitForTimeout(2000);
    console.log('Detail URL:', page.url());
    const h1 = await page.locator('h1').innerText();
    console.log('Detail H1:', h1);
    const detailScreenshotPath = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_article_detail_oct8.png');
    await page.screenshot({ path: detailScreenshotPath });
    console.log('📸 Saved live_article_detail_oct8.png');
  }

  await browser.close();
}

checkArticles().catch(console.error);
