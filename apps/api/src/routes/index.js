import { Router } from 'express';
import healthCheck from './health-check.js';
import testRouter from './test.js';
import vipTestRouter from './vip-test.js';
import vipDebugRouter from './vip-debug.js';
import vipLoginRouter from './vip-login.js';
import blogRouter from './blog.js';
import affiliateRouter from './affiliate.js';
import sheetsRouter from './sheets.js';
import otpRouter from './otp.js';
import pinterestRouter from './pinterest.js';
import scheduledJobsRouter from './scheduled-jobs.js';
import generateBlogRouter from './generate-blog.js';
import gumroadWebhookRouter from './gumroad-webhook.js';
import geminiChatRouter from './gemini-chat.js';
import generateResumeRouter from './generate-resume.js';
import generateCoverLetterRouter from './generate-cover-letter.js';
import generateJobDescriptionRouter from './generate-job-description.js';
import generateCvRouter from './generate-cv.js';
import integratedAiRouter from './integrated-ai.js';
import generateVaultFilesRouter from './generate-vault-files.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/test', testRouter);
    router.use('/vip-test', vipTestRouter);
    router.use('/vip-debug', vipDebugRouter);
    router.use('/vip-login', vipLoginRouter);
    router.use('/blog', blogRouter);
    router.use('/affiliate', affiliateRouter);
    router.use('/sheets', sheetsRouter);
    router.use('/otp', otpRouter);
    router.use('/pinterest', pinterestRouter);
    router.use('/scheduled-jobs', scheduledJobsRouter);
    router.use('/generate-blog', generateBlogRouter);
    router.use('/gumroad-webhook', gumroadWebhookRouter);
    router.use('/gemini-chat', geminiChatRouter);
    router.use('/generate-resume', generateResumeRouter);
    router.use('/generate-cover-letter', generateCoverLetterRouter);
    router.use('/generate-job-description', generateJobDescriptionRouter);
    router.use('/generate-cv', generateCvRouter);
    router.use('/integrated-ai', integratedAiRouter);
    router.use('/generate-vault-files', generateVaultFilesRouter);

    return router;
};