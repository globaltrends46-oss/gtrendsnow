import 'dotenv/config';
import logger from './logger.js';

/**
 * Test script to verify /generate-blog endpoint
 * Usage: node src/utils/test-generate-blog.js
 */

async function testGenerateBlog() {
	const baseUrl = 'http://localhost:3001/hcgi/api/generate-blog';

	logger.info('🚀 Starting /generate-blog endpoint test');
	logger.info('📍 Endpoint:', baseUrl);
	logger.info('📝 Testing: AI blog post generation with authentication');

	try {
		logger.info('📤 Sending POST request to /generate-blog...');

		const response = await fetch(baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
			logger.info(`  Post ID: ${data.postId}`);
			logger.info(`  Title: ${data.title}`);
			logger.info(`  Region: ${data.region}`);
			logger.info(`  Published Date: ${data.publishedDate}`);
			logger.info(`  Content Length: ${data.contentLength} characters`);
			logger.info(`  Featured Image URL: ${data.featuredImageUrl || 'Not generated'}`);
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
		logger.error('❌ EXCEPTION during test:', error.message);
		logger.error('Stack:', error.stack);
		return {
			success: false,
			error: error.message,
		};
	}
}

// Run the test
testGenerateBlog().then(result => {
	logger.info('\n🎯 Final Result:');
	logger.info(JSON.stringify(result, null, 2));
	process.exit(result.success ? 0 : 1);
});