import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startPocketBase() {
  console.log('📦 Launching PocketBase directly from API main.js startup...');
  const pbPath = path.resolve(__dirname, '../../pocketbase/pocketbase');
  
  try {
    if (fs.existsSync(pbPath)) {
      fs.chmodSync(pbPath, '755');
      console.log('✅ PocketBase execution rights verified in main.js');
    }
  } catch (e) {
    console.error('⚠️ Failed to chmod pocketbase in main.js:', e.message);
  }

  const pbProcess = spawn('./pocketbase', [
    'serve',
    '--http=127.0.0.1:8090',
    '--dir=./pb_data',
    '--migrationsDir=./pb_migrations',
    '--hooksDir=./pb_hooks',
    '--hooksWatch=false'
  ], {
    cwd: path.resolve(__dirname, '../../pocketbase'),
    stdio: 'inherit',
    shell: true
  });

  pbProcess.on('error', (err) => {
    console.error('❌ Failed to start PocketBase process from main.js:', err);
  });

  pbProcess.on('exit', (code) => {
    console.log(`⚠️ PocketBase exited from main.js with code ${code}`);
  });
}

// Spin up PocketBase database background instance
startPocketBase();

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
app.use('/hcgi/api', routes());

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