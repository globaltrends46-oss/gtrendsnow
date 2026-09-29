import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = path.resolve('C:/Users/Ram Babu Singh/.gemini/antigravity/brain/edab6bf6-8bbd-407b-a86a-afa4619cd291');

async function runVerification() {
  console.log('🚀 Launching Playwright browser to test https://gtrendsnow.com live...');
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });
  
  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  // Track errors and failed network responses
  const failedRequests = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  try {
    // ------------------------------------------------------------------
    // TEST 1: HOME PAGE & DONATION MODAL
    // ------------------------------------------------------------------
    console.log('🌐 1. Navigating to https://gtrendsnow.com...');
    await page.goto('https://gtrendsnow.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Screenshot Home page
    const homeScreenshot = path.join(artifactDir, 'live_homepage.png');
    await page.screenshot({ path: homeScreenshot, fullPage: false });
    console.log('📸 Saved live_homepage.png');

    // Find and Click Donate Button
    console.log('💖 Clicking Donate button...');
    const donateBtn = page.getByRole('button', { name: /Donate/i }).first();
    await donateBtn.click();
    await page.waitForTimeout(1000);

    // Verify modal is open and centered (not clipped off screen)
    const modalHeading = page.getByText(/Turn Technology Into Human Impact/i);
    const isModalVisible = await modalHeading.isVisible();
    console.log('Modal Visible:', isModalVisible);

    const modalBox = await modalHeading.boundingBox();
    console.log('Modal heading bounding box:', modalBox);

    const donateScreenshot = path.join(artifactDir, 'live_donation_modal.png');
    await page.screenshot({ path: donateScreenshot });
    console.log('📸 Saved live_donation_modal.png');

    // Close Modal
    const closeBtn = page.getByRole('button', { name: /Close/i });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // ------------------------------------------------------------------
    // TEST 2: MCP DIRECTORY & LIVE GITHUB SEARCH
    // ------------------------------------------------------------------
    console.log('🔍 2. Navigating to https://gtrendsnow.com/mcp...');
    await page.goto('https://gtrendsnow.com/mcp', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const mcpInitialScreenshot = path.join(artifactDir, 'live_mcp_initial.png');
    await page.screenshot({ path: mcpInitialScreenshot });
    console.log('📸 Saved live_mcp_initial.png');

    // Search for "gods" in the search box
    console.log('⌨️ Searching for "gods" in MCP directory...');
    const searchInput = page.getByPlaceholder(/Search by keyword/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('gods');
    await page.waitForTimeout(4000); // Give time for GitHub live search to return

    const mcpSearchScreenshot = path.join(artifactDir, 'live_mcp_search_gods.png');
    await page.screenshot({ path: mcpSearchScreenshot });
    console.log('📸 Saved live_mcp_search_gods.png');

    // Check count of items in search results
    const cardsOrRows = await page.locator('table tr, [class*="rounded-2xl"]').count();
    console.log(`Found ${cardsOrRows} items/rows matching "gods"`);

    // ------------------------------------------------------------------
    // TEST 3: ARTICLES PAGE
    // ------------------------------------------------------------------
    console.log('📰 3. Navigating to https://gtrendsnow.com/articles...');
    await page.goto('https://gtrendsnow.com/articles', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const articlesScreenshot = path.join(artifactDir, 'live_articles.png');
    await page.screenshot({ path: articlesScreenshot });
    console.log('📸 Saved live_articles.png');

    // Extract first 3 dates displayed
    const dates = await page.locator('span:text-matches("2026|ago|Today", "i")').allInnerTexts();
    console.log('Visible Dates on Articles Page:', dates.slice(0, 8));

    // ------------------------------------------------------------------
    // TEST 4: BLOG PAGE
    // ------------------------------------------------------------------
    console.log('📚 4. Navigating to https://gtrendsnow.com/blog...');
    await page.goto('https://gtrendsnow.com/blog', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const blogScreenshot = path.join(artifactDir, 'live_blog.png');
    await page.screenshot({ path: blogScreenshot });
    console.log('📸 Saved live_blog.png');

    console.log('====================================================');
    console.log('✅ ALL PLAYWRIGHT VERIFICATION CHECKS COMPLETED!');
    console.log('Failed HTTP requests during navigation:', failedRequests);
    console.log('====================================================');

  } catch (err) {
    console.error('❌ Playwright test failed:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
