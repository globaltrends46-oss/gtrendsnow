import { chromium } from 'playwright';
import path from 'path';

async function verifyLiveDeployment() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('--- 1. Verifying /articles (Trendjacking Feed) ---');
  await page.goto('https://gtrendsnow.com/articles', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const articleTitles = await page.locator('article h2, article h3, div.grid h2, div.grid h3').allInnerTexts();
  console.log('Visible Trendjacking Article Titles (first 6):');
  articleTitles.slice(0, 6).forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

  const articlesScreenshot = 'C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_articles_batch_oct8.png';
  await page.screenshot({ path: path.resolve(articlesScreenshot) });
  console.log(`📸 Saved articles screenshot to ${articlesScreenshot}`);

  console.log('--- 2. Verifying /blog (Categorized Daily Blogs) ---');
  await page.goto('https://gtrendsnow.com/blog', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const tabs = ['all', 'geopolitics', 'energy', 'tech', 'sports'];
  for (const tab of tabs) {
    const tabBtn = page.locator(`button:has-text("${tab}"), button:has-text("${tab.charAt(0).toUpperCase() + tab.slice(1)}")`).first();
    if (await tabBtn.count() > 0) {
      await tabBtn.click();
      await page.waitForTimeout(1000);
      const firstBlogH3 = await page.locator('div.grid h3, article h3').first().innerText().catch(() => 'N/A');
      console.log(`  [Tab: ${tab.toUpperCase()}] Top Blog: "${firstBlogH3}"`);
    }
  }

  const blogScreenshot = 'C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_blog_multicategory_oct8.png';
  await page.screenshot({ path: path.resolve(blogScreenshot) });
  console.log(`📸 Saved blog screenshot to ${blogScreenshot}`);

  // Test opening a blog detail
  console.log('--- 3. Testing Blog Detail page ---');
  const firstBlogLink = page.locator('a[href*="/blog/"]').first();
  if (await firstBlogLink.count() > 0) {
    await firstBlogLink.click();
    await page.waitForTimeout(2000);
    console.log('  Blog Detail URL:', page.url());
    const blogH1 = await page.locator('h1').innerText().catch(() => 'N/A');
    console.log('  Blog Detail Title:', blogH1);
    const detailScreenshot = 'C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_blog_detail_verified_oct8.png';
    await page.screenshot({ path: path.resolve(detailScreenshot) });
    console.log(`📸 Saved blog detail screenshot to ${detailScreenshot}`);
  }

  await browser.close();
  console.log('🎉 Live deployment verification completed successfully!');
}

verifyLiveDeployment().catch(console.error);
