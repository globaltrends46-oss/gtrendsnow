import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import { BodyLimit } from './constants/common.js';
import { dailyBlogPublisher, trendjackingPublisher, weeklyNewsletter } from './jobs/index.js';
import pb from './utils/pocketbaseClient.js';

const app = express();

app.set('trust proxy', true);

// Verify MESSAGE91_API_KEY is loaded
if (process.env.MESSAGE91_API_KEY) {
	console.log('✓ MESSAGE91_API_KEY loaded successfully');
} else {
	console.warn('⚠ MESSAGE91_API_KEY not found in environment variables');
}

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception:', error);
});
  
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
	logger.info('Interrupted');
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received');

	await new Promise(resolve => setTimeout(resolve, 3000));

	logger.info('Exiting');
	process.exit();
});

app.use(helmet());
app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials: true,
}));
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(express.json({
	limit: BodyLimit,
}));
app.use(express.urlencoded({ 
	extended: true,
	limit: BodyLimit,
}));

app.use('/', routes());

app.use(errorMiddleware);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

// Schedule daily blog job (9 AM UTC)
cron.schedule('0 9 * * *', () => {
	dailyBlogPublisher(pb, logger).catch(err => logger.error('Daily blog job failed:', err));
});
logger.info('Daily blog publishing job scheduled (9 AM UTC)');

// Schedule trendjacking articles twice daily (8 AM & 8 PM UTC)
cron.schedule('0 8,20 * * *', () => {
	trendjackingPublisher(pb, logger).catch(err => logger.error('Trendjacking job failed:', err));
});
logger.info('Trendjacking publisher job scheduled (8 AM & 8 PM UTC)');

// Schedule weekly newsletter job (Monday 9 AM UTC)
cron.schedule('0 9 * * 1', () => {
	weeklyNewsletter(pb, logger).catch(err => logger.error('Weekly newsletter job failed:', err));
});
logger.info('Weekly newsletter job scheduled (Monday 9 AM UTC)');

const port = process.env.PORT || 3001;

app.listen(port, () => {
	logger.info(`🚀 API Server running on http://localhost:${port}`);
});

export default app;