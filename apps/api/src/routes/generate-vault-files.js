import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import { generateVaultFiles } from '../utils/generate-vault-files.js';

const router = express.Router();

// Apply PocketBase authentication middleware
router.use(pocketbaseAuth);

/**
 * POST /generate-vault-files - Generate all vault files for VIP users
 * Requires: PocketBase authentication + VIP status
 */
router.post('/', async (req, res) => {
  const userId = req.pocketbaseUserId;

  logger.info('📦 Vault files generation request received', { userId });

  try {
    // Step 1: Get user email from PocketBase
    logger.info('🔍 Fetching user details from PocketBase', { userId });
    let userEmail = null;

    try {
      const userRecord = await pb.collection('users').getOne(userId);
      userEmail = userRecord.email;
      logger.info('✅ User email retrieved', { userId, email: userEmail });
    } catch (error) {
      logger.warn('⚠️ Could not fetch user email from users collection', { userId, error: error.message });
    }

    // Step 2: Verify VIP status
    logger.info('🔐 Verifying VIP status', { userId, email: userEmail });

    let isVip = false;
    let vipRecord = null;

    // Try vip_customers collection first
    if (userEmail) {
      try {
        vipRecord = await pb.collection('vip_customers').getFirstListItem(`email="${userEmail}"`);
        if (vipRecord && vipRecord.status === 'active') {
          isVip = true;
          logger.info('✅ VIP status verified via vip_customers', { email: userEmail, status: vipRecord.status });
        }
      } catch (error) {
        logger.info('ℹ️ User not found in vip_customers collection', { email: userEmail });
      }
    }

    // Try vip_users collection if not found in vip_customers
    if (!isVip && userEmail) {
      try {
        vipRecord = await pb.collection('vip_users').getFirstListItem(`email="${userEmail}"`);
        if (vipRecord && vipRecord.status === 'active') {
          isVip = true;
          logger.info('✅ VIP status verified via vip_users', { email: userEmail, status: vipRecord.status });
        }
      } catch (error) {
        logger.info('ℹ️ User not found in vip_users collection', { email: userEmail });
      }
    }

    // Throw error if not VIP
    if (!isVip) {
      logger.warn('❌ Unauthorized: User is not VIP', { userId, email: userEmail });
      throw new Error('Unauthorized: VIP access required');
    }

    // Step 3: Generate vault files
    logger.info('📦 Generating vault files', { userId, email: userEmail });
    const result = await generateVaultFiles();

    logger.info('✅ Vault files generated successfully', {
      userId,
      email: userEmail,
      files: Object.keys(result.files),
    });

    // Step 4: Return success response
    res.json({
      success: true,
      message: 'Vault files generated successfully',
      userId,
      email: userEmail,
      files: result.files,
      vaultDirectory: result.vaultDirectory,
      downloadUrls: {
        financialMaster: '/assets/vault/Financial_Independence_&_Business_Master.xlsx',
        freelanceAgreement: '/assets/vault/Freelance_Master_Service_Agreement.docx',
        coldEmailVault: '/assets/vault/The_Cold_Email_Swipe_Vault.docx',
        seoChecklist: '/assets/vault/SEO_Audit_100_Point_Checklist.xlsx',
      },
    });
  } catch (error) {
    logger.error('❌ Vault files generation failed', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
});

export default router;