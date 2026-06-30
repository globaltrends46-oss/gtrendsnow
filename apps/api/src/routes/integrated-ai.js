import { Router } from 'express';
import { ContentBlockType, stream, uploadImagesToPocketBase } from '../api/integrated-ai.js';
import { SystemPrompt } from '../constants/prompts.js';
import { uploadFiles } from '../middleware/file-upload.js';
import { integratedAiRateLimit } from '../middleware/integrated-ai-rate-limit.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(pocketbaseAuth);

router.post('/stream', integratedAiRateLimit, uploadFiles({
	allowedMimeTypes: [
		'image/jpeg',
		'image/png',
		'image/webp',
	],
	fieldName: 'images',
}), async (req, res) => {
	const { message } = req.body;

	logger.info('📨 POST /integrated-ai/stream request received', {
		userId: req.pocketbaseUserId,
		messageLength: message ? message.length : 0,
		hasFiles: req.files?.length > 0,
	});

	if (!message) {
		logger.warn('⚠️ Missing message parameter in request');
		throw new Error('message is required');
	}

	try {
		const parsedMessage = JSON.parse(message);
		logger.info('✅ Message parsed successfully', { messageType: Array.isArray(parsedMessage) ? 'array' : 'object' });

		if (req.files?.length > 0) {
			logger.info(`📸 Processing ${req.files.length} uploaded image(s)`);
			const imageUrls = await uploadImagesToPocketBase({ images: req.files });
			logger.info(`✅ Images uploaded successfully`, { count: imageUrls.length });
			imageUrls.forEach((url) => {
				parsedMessage.push({ type: ContentBlockType.Image, image: url });
			});
		}

		logger.info('🤖 Calling stream() function from integrated-ai.js', {
			userId: req.pocketbaseUserId,
			systemPromptLength: SystemPrompt.length,
		});

		const sseStream = await stream({
			userId: req.pocketbaseUserId,
			systemPrompt: SystemPrompt,
			userMessage: parsedMessage,
		});

		logger.info('✅ SSE stream created, setting response headers');

		// Set SSE headers
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');
		res.setHeader('X-Accel-Buffering', 'no');

		logger.info('📡 SSE headers set, piping stream to response');

		// Pipe SSE stream to response
		sseStream.pipe(res, { end: false });

		// Handle stream end
		sseStream.on('end', () => {
			logger.info('✅ SSE stream ended normally');
			res.end();
		});

		// Handle stream errors
		sseStream.on('error', (error) => {
			logger.error('❌ SSE stream error', { error: error.message, stack: error.stack });
			if (!res.headersSent) {
				res.status(500).json({ error: 'Stream error' });
			} else {
				res.write(`data: {"type":"error","error":"${error.message}"}

`);
				res.end();
			}
		});

		// Handle client disconnect
		res.on('close', () => {
			logger.info('📴 Client disconnected from SSE stream');
			sseStream.destroy();
		});

	} catch (error) {
		logger.error('❌ Error in /integrated-ai/stream handler', {
			error: error.message,
			stack: error.stack,
		});
		throw error;
	}
});

export default router;