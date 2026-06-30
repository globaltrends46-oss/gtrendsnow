import 'dotenv/config';
import logger from './logger.js';

/**
 * Trigger blog generation endpoint with PocketBase admin authentication
 * Usage: node src/utils/trigger-blog-generation.js
 */

async function triggerBlogGeneration() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  const generateBlogUrl = 'http://localhost:3001/hcgi/api/generate-blog';

  logger.info('🚀 Starting Blog Generation Trigger');
  logger.info('📍 Endpoint:', generateBlogUrl);
  logger.info('🔐 Admin Email:', adminEmail);

  if (!adminEmail || !adminPassword) {
    logger.error('❌ POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD not configured in .env');
    return {
      success: false,
      error: 'Missing PocketBase admin credentials in .env file',
    };
  }

  try {
    logger.info('📤 Sending POST request to /generate-blog endpoint...');
    logger.info('⏳ This may take 1-2 minutes as the AI generates content and images...');

    const response = await fetch(generateBlogUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    logger.info(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('❌ Request failed:', errorText);
      return {
        success: false,
        status: response.status,
        error: errorText,
      };
    }

    logger.info('✅ Response OK, parsing JSON...');
    const data = await response.json();

    logger.info('📥 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      logger.info('\n✅ SUCCESS: Blog post generated and published!');
      logger.info('📋 Blog Post Details:');
      logger.info(`  ✓ Post ID: ${data.postId}`);
      logger.info(`  ✓ Title: ${data.title}`);
      logger.info(`  ✓ Region: ${data.region}`);
      logger.info(`  ✓ Published Date: ${data.publishedDate}`);
      logger.info(`  ✓ Content Length: ${data.contentLength} characters`);
      logger.info(`  ✓ Featured Image: ${data.featuredImageUrl || 'Not generated'}`);
      logger.info('\n🎉 Blog post is now live in PocketBase!');
      return {
        success: true,
        status: response.status,
        postId: data.postId,
        title: data.title,
        region: data.region,
        publishedDate: data.publishedDate,
        contentLength: data.contentLength,
        featuredImageUrl: data.featuredImageUrl,
      };
    } else {
      logger.error('❌ FAILED: Endpoint returned success=false');
      logger.error('Response:', JSON.stringify(data, null, 2));
      return {
        success: false,
        error: data.message || 'Unknown error',
      };
    }
  } catch (error) {
    logger.error('❌ EXCEPTION during blog generation trigger:', error.message);
    logger.error('Stack:', error.stack);
    logger.error('\n⚠️ Make sure:');
    logger.error('  1. The API server is running (npm run dev)');
    logger.error('  2. PocketBase is running and accessible');
    logger.error('  3. The integrated-ai endpoint is working');
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the trigger
triggerBlogGeneration().then(result => {
  logger.info('\n🎯 Final Result:');
  logger.info(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});