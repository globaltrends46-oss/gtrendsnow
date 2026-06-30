import 'dotenv/config';
import logger from './logger.js';

/**
 * Manual test script to trigger Pinterest API pin creation
 * Usage: node src/utils/test-pinterest.js
 */

async function testPinterestPin() {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  
  if (!accessToken) {
    logger.error('❌ PINTEREST_ACCESS_TOKEN not set in .env file');
    process.exit(1);
  }

  // Pin data from user request
  const pinData = {
    title: 'The Ultimate Guide to ₹1 Crore: Mastering the SIP Top-Up Strategy in the 2026 Indian Market',
    description: 'First 200 characters of the blog content as teaser', // Replace with actual content
    link: 'https://gtrendsnow.com/blog/sip-top-up-1-crore-strategy',
    image_url: '[featured image URL from blog post]', // Replace with actual image URL
    board_id: '1118226101377855660',
  };

  logger.info('🚀 Starting Pinterest Pin Creation Test');
  logger.info('📌 Pin Data:', JSON.stringify(pinData, null, 2));

  try {
    logger.info('📤 Sending request to Pinterest API v5...');
    
    const response = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pinData),
    });

    logger.info(`📊 Response Status: ${response.status} ${response.statusText}`);

    const responseData = await response.json();
    logger.info('📥 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      logger.info('✅ SUCCESS: Pin created successfully!');
      logger.info(`📍 Pin ID: ${responseData.id}`);
      logger.info(`🔗 Pin URL: https://pinterest.com/pin/${responseData.id}`);
      return {
        success: true,
        pinId: responseData.id,
        pin: responseData,
      };
    } else {
      logger.error('❌ FAILED: Pinterest API returned an error');
      logger.error('Error Details:', JSON.stringify(responseData, null, 2));
      return {
        success: false,
        error: responseData,
      };
    }
  } catch (error) {
    logger.error('❌ EXCEPTION: Error during Pinterest API call');
    logger.error('Error Message:', error.message);
    logger.error('Error Stack:', error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
testPinterestPin().then(result => {
  logger.info('\n📋 Test Result Summary:');
  logger.info(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});