import 'dotenv/config';
import logger from './logger.js';

/**
 * Test script to verify Pinterest API pin creation with exact payload
 * Usage: node src/utils/test-pinterest-pin.js
 */

async function testPinterestPin() {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  
  if (!accessToken) {
    logger.error('❌ PINTEREST_ACCESS_TOKEN not set in .env file');
    logger.error('Please add PINTEREST_ACCESS_TOKEN to apps/api/.env');
    process.exit(1);
  }

  // Exact payload from user request
  const pinData = {
    title: 'How to Reach ₹1 Crore: The SIP Top-Up Secret for 2026',
    description: 'Most Indian investors use SIPs, but the real wealth is built using a "Top-Up" strategy. By increasing your SIP by just 10% every year, you can reach your ₹1 Crore goal 5-7 years earlier than a flat SIP.',
    link: 'https://gtrendsnow.com/blog/sip-top-up-1-crore-strategy',
    image_url: 'https://gtrendsnow.com/images/sip-top-up-1-crore.jpg', // Replace with actual featured image URL
    board_id: '1118226101377855660',
  };

  logger.info('🚀 Starting Pinterest Pin Creation Test');
  logger.info('📌 Pin Data:', JSON.stringify(pinData, null, 2));
  logger.info('🔑 Access Token:', accessToken.substring(0, 20) + '...');

  try {
    logger.info('📤 Sending request to Pinterest API v5...');
    logger.info('🌐 Endpoint: https://api.pinterest.com/v5/pins');
    
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
      logger.info(`📌 Board URL: https://pinterest.com/gtrends_network/`);
      return {
        success: true,
        pinId: responseData.id,
        pinUrl: `https://pinterest.com/pin/${responseData.id}`,
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