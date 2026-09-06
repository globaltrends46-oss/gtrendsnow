import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
// Root debug.log file
const logFile = path.resolve(process.cwd(), 'debug.log');

function logToFile(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] [main.js] ${msg}\n`);
  } catch (e) {}
}

logToFile('⚡ main.js execution started...');

dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';
import fetch from 'node-fetch';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import { BodyLimit } from './constants/common.js';
import { dailyBlogPublisher, trendjackingPublisher, weeklyNewsletter } from './jobs/index.js';
import { updateMcpRegistry } from './jobs/mcp-registry-updater.js';
import pb from './utils/pocketbaseClient.js';

const app = express();

app.set('trust proxy', true);

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

// Hardened Enterprise CORS Origin Validation
const ALLOWED_ORIGINS = [
  'https://gtrendsnow.com',
  'https://www.gtrendsnow.com',
  'https://gateway.gtrendsnow.com',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Allow localhost in development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.endsWith('.gtrendsnow.com'))) {
      return callback(null, true);
    }

    logger.warn(`🛑 Blocked unauthorized CORS origin attempt: ${origin}`);
    callback(new Error('Blocked by CORS Security Policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'X-Title', 'HTTP-Referer'],
  maxAge: 86400
};

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(express.json({
	limit: BodyLimit,
}));
app.use(express.urlencoded({ 
	extended: true,
	limit: BodyLimit,
}));

app.use('/hcgi/api', routes());
app.use('/hcgi', routes());
app.use('/api', routes());
app.use('/', routes());

app.use(errorMiddleware);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

// Schedule daily blog jobs spread over time
cron.schedule('0 2 * * *', () => {
	dailyBlogPublisher(pb, logger, 'geopolitics').catch(err => logger.error('Geopolitics daily blog job failed:', err));
});
logger.info('Geopolitics daily blog job scheduled (2 AM UTC)');

cron.schedule('0 8 * * *', () => {
	dailyBlogPublisher(pb, logger, 'energy').catch(err => logger.error('Energy daily blog job failed:', err));
});
logger.info('Energy & Markets daily blog job scheduled (8 AM UTC)');

cron.schedule('0 14 * * *', () => {
	dailyBlogPublisher(pb, logger, 'tech').catch(err => logger.error('Tech daily blog job failed:', err));
});
logger.info('Tech & AI daily blog job scheduled (2 PM UTC)');

cron.schedule('0 20 * * *', () => {
	dailyBlogPublisher(pb, logger, 'sports').catch(err => logger.error('Sports daily blog job failed:', err));
});
logger.info('Sports & Culture daily blog job scheduled (8 PM UTC)');

cron.schedule('0 8,20 * * *', () => {
	trendjackingPublisher(pb, logger).catch(err => logger.error('Trendjacking job failed:', err));
});
logger.info('Trendjacking publisher job scheduled (8 AM & 8 PM UTC)');

cron.schedule('0 9 * * 1', () => {
	weeklyNewsletter(pb, logger).catch(err => logger.error('Weekly newsletter job failed:', err));
});
logger.info('Weekly newsletter job scheduled (Monday 9 AM UTC)');

cron.schedule('0 3 * * *', () => {
	updateMcpRegistry(logger).catch(err => logger.error('MCP registry updater failed:', err));
});
logger.info('Daily MCP registry star updater job scheduled (3 AM UTC)');

const port = process.env.PORT || 3001;

logToFile(`📡 Calling app.listen on port: ${port}`);
app.listen(port, () => {
	logToFile(`🚀 API Server running on port: ${port}`);
	logger.info(`🚀 API Server running on http://localhost:${port}`);

	// Anti-Sleep Heartbeat Keep-Alive Interval (pings server every 4 minutes to prevent Hostinger idle sleep)
	setInterval(() => {
		fetch(`http://127.0.0.1:${port}/hcgi/api/analytics/stats`).catch(() => {});
	}, 4 * 60 * 1000);

	// Automatic boot check: Trigger a trendjacking article run on server startup to verify publishing
	setTimeout(() => {
		logger.info('⚡ Running automatic startup trendjacking publisher check...');
		trendjackingPublisher(pb, logger).catch(err => logger.warn('Startup publisher check status:', err.message));
	}, 15000);
});

export default app;