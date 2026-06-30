import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /vip-test - Test PocketBase connection and vip_customers collection
router.get('/', async (req, res) => {
  logger.info('🧪 VIP Test Endpoint: Testing PocketBase connection');

  try {
    logger.info('📡 Attempting to fetch vip_customers collection info from PocketBase');
    const collectionInfo = await pb.collections.getOne('vip_customers');

    logger.info('✅ PocketBase connection successful', {
      collection: 'vip_customers',
      schemaFields: collectionInfo.schema.length,
    });

    res.json({
      success: true,
      collection: 'vip_customers',
      recordCount: collectionInfo.schema.length,
      collectionName: collectionInfo.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ PocketBase connection failed', {
      error: error.message,
      errorCode: error.code,
      errorStatus: error.status,
    });

    res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;