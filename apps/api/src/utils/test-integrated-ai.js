import 'dotenv/config';
import logger from './logger.js';

/**
 * Test script to verify integrated-ai stream endpoint
 * Usage: node src/utils/test-integrated-ai.js
 */

async function testIntegratedAiStream() {
	const baseUrl = 'http://localhost:3001/hcgi/api/integrated-ai/stream';
	const testToken = 'test-token-12345';

	const testMessage = JSON.stringify([
		{
			type: 'text',
			text: 'Hello! Please write a short paragraph about the future of remote work.',
		},
	]);

	logger.info('🚀 Starting integrated-ai stream endpoint test');
	logger.info('📍 Endpoint:', baseUrl);
	logger.info('🔑 Auth Token:', testToken);
	logger.info('📨 Message:', testMessage);

	try {
		logger.info('📤 Sending POST request to integrated-ai/stream...');

		const response = await fetch(baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${testToken}`,
			},
			body: JSON.stringify({
				message: testMessage,
			}),
		});

		logger.info(`📊 Response Status: ${response.status} ${response.statusText}`);
		logger.info('📋 Response Headers:');
		logger.info(`  Content-Type: ${response.headers.get('Content-Type')}`);
		logger.info(`  Cache-Control: ${response.headers.get('Cache-Control')}`);
		logger.info(`  Connection: ${response.headers.get('Connection')}`);

		if (!response.ok) {
			const errorText = await response.text();
			logger.error('❌ Request failed:', errorText);
			return {
				success: false,
				status: response.status,
				error: errorText,
			};
		}

		logger.info('✅ Response OK, reading SSE stream...');

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let fullContent = '';
		let eventCount = 0;
		let doneReceived = false;

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value, { stream: true });
			const lines = chunk.split('\n');

			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const jsonStr = line.slice(6);

					if (jsonStr === '[DONE]') {
						logger.info('✅ [DONE] signal received');
						doneReceived = true;
						continue;
					}

					try {
						const event = JSON.parse(jsonStr);
						eventCount++;

						if (event.type === 'content') {
							fullContent += event.data.content;
							logger.info(`📝 Content event #${eventCount}:`, event.data.content.substring(0, 50) + '...');
						} else if (event.type === 'error') {
							logger.error(`❌ Error event #${eventCount}:`, event.error);
						} else {
							logger.info(`📨 Event #${eventCount} (type: ${event.type}):`, JSON.stringify(event).substring(0, 100));
						}
					} catch (e) {
						logger.warn('⚠️ Failed to parse SSE event:', { line, error: e.message });
					}
				}
			}
		}

		reader.releaseLock();

		logger.info('\n📋 Test Summary:');
		logger.info(`✅ Total events received: ${eventCount}`);
		logger.info(`✅ [DONE] signal received: ${doneReceived}`);
		logger.info(`✅ Total content length: ${fullContent.length} characters`);
		logger.info(`✅ Content preview: ${fullContent.substring(0, 100)}...`);

		return {
			success: true,
			status: response.status,
			eventCount,
			doneReceived,
			contentLength: fullContent.length,
			contentPreview: fullContent.substring(0, 200),
		};
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
testIntegratedAiStream().then(result => {
	logger.info('\n🎯 Final Result:');
	logger.info(JSON.stringify(result, null, 2));
	process.exit(result.success ? 0 : 1);
});