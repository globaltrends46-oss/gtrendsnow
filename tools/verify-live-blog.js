import { chromium } from 'playwright';
import path from 'path';

async function checkBlog() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Navigating to https://gtrendsnow.com/blog...');
  await page.goto('https://gtrendsnow.com/blog', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Check card titles on first tab (Geopolitics)
  const geopoliticsTitles = await page.locator('article h3, h3').allInnerTexts();
  console.log('Geopolitics tab visible titles:', geopoliticsTitles.slice(0, 5));

  const screenshotPath1 = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_blog_geopolitics_oct8.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log('📸 Saved live_blog_geopolitics_oct8.png');

  // Click Energy & Markets tab
  console.log('Clicking Energy tab...');
  const energyTab = page.locator('button:has-text("Energy")');
  if (await energyTab.count() > 0) {
    await energyTab.click();
    await page.waitForTimeout(2000);
    const energyTitles = await page.locator('article h3, h3').allInnerTexts();
    console.log('Energy tab visible titles:', energyTitles.slice(0, 5));
    const screenshotPath2 = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_blog_energy_oct8.png');
    await page.screenshot({ path: screenshotPath2 });
    console.log('📸 Saved live_blog_energy_oct8.png');
  }

  // Click Tech tab
  console.log('Clicking Tech tab...');
  const techTab = page.locator('button:has-text("Tech")');
  if (await techTab.count() > 0) {
    await techTab.click();
    await page.waitForTimeout(2000);
    const techTitles = await page.locator('article h3, h3').allInnerTexts();
    console.log('Tech tab visible titles:', techTitles.slice(0, 5));
  }

  // Click first card to verify blog detail page
  const firstLink = page.locator('article a[href*="/blog/"]').first();
  if (await firstLink.count() > 0) {
    await firstLink.click();
    await page.waitForTimeout(2000);
    console.log('Detail URL:', page.url());
    const h1 = await page.locator('h1').innerText();
    console.log('Detail H1:', h1);
    const detailScreenshotPath = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291/live_blog_detail_oct8.png');
    await page.screenshot({ path: detailScreenshotPath });
    console.log('📸 Saved live_blog_detail_oct8.png');
  }

  await browser.close();
}

checkBlog().catch(console.error);
