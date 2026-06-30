import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /vip-debug - Debug endpoint for VIP customer lookup testing
router.get('/', async (req, res) => {
  const { email } = req.query;

  logger.info('🔍 VIP Debug Endpoint: Request received', { email });

  // Validate email parameter
  if (!email) {
    logger.warn('⚠️ VIP Debug: Missing email query parameter');
    return res.status(400).json({
      success: false,
      error: 'Email query parameter is required (?email=example@gmail.com)',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  logger.info('📧 Email normalized', { originalEmail: email, normalizedEmail });

  const debugResult = {
    success: false,
    email: normalizedEmail,
    queries: {},
    allRecords: [],
    errors: [],
  };

  try {
    // ============================================================
    // QUERY 1: getFirstListItem with filter
    // ============================================================
    logger.info('\n🔍 QUERY 1: Testing getFirstListItem with filter');
    const filterQuery1 = 'email="' + normalizedEmail + '"';
    logger.info('📝 Filter string:', { filter: filterQuery1 });

    debugResult.queries.query1 = {
      method: 'getFirstListItem',
      filter: filterQuery1,
      result: null,
      error: null,
    };

    try {
      logger.info('📡 Calling pb.collection("vip_customers").getFirstListItem()', {
        filter: filterQuery1,
      });

      const record1 = await pb.collection('vip_customers').getFirstListItem(filterQuery1);

      logger.info('✅ Query 1 successful, record found', {
        recordId: record1.id,
        email: record1.email,
        status: record1.status,
        expirationDate: record1.expiration_date,
      });

      debugResult.queries.query1.result = {
        id: record1.id,
        email: record1.email,
        status: record1.status,
        expiration_date: record1.expiration_date,
        next_billing_date: record1.next_billing_date,
        auto_renewal: record1.auto_renewal,
        license_key: record1.license_key,
        purchase_date: record1.purchase_date,
        last_charge_id: record1.last_charge_id,
        created: record1.created,
        updated: record1.updated,
      };
      debugResult.success = true;
    } catch (error1) {
      logger.error('❌ Query 1 failed', {
        filter: filterQuery1,
        errorMessage: error1.message,
        errorCode: error1.code,
        errorStatus: error1.status,
      });

      debugResult.queries.query1.error = {
        message: error1.message,
        code: error1.code,
        status: error1.status,
      };
      debugResult.errors.push(`Query 1 Error: ${error1.message}`);
    }

    // ============================================================
    // QUERY 2: getList with filter
    // ============================================================
    logger.info('\n🔍 QUERY 2: Testing getList with filter');
    const filterQuery2 = 'email="' + normalizedEmail + '"';
    logger.info('📝 Filter string:', { filter: filterQuery2 });

    debugResult.queries.query2 = {
      method: 'getList',
      page: 1,
      perPage: 1,
      filter: filterQuery2,
      result: null,
      error: null,
    };

    try {
      logger.info('📡 Calling pb.collection("vip_customers").getList(1, 1, {filter})', {
        filter: filterQuery2,
      });

      const list2 = await pb.collection('vip_customers').getList(1, 1, {
        filter: filterQuery2,
      });

      logger.info('✅ Query 2 successful', {
        totalItems: list2.totalItems,
        itemsCount: list2.items.length,
        page: list2.page,
        perPage: list2.perPage,
      });

      debugResult.queries.query2.result = {
        totalItems: list2.totalItems,
        page: list2.page,
        perPage: list2.perPage,
        items: list2.items.map(item => ({
          id: item.id,
          email: item.email,
          status: item.status,
          expiration_date: item.expiration_date,
          next_billing_date: item.next_billing_date,
          auto_renewal: item.auto_renewal,
          license_key: item.license_key,
          purchase_date: item.purchase_date,
          last_charge_id: item.last_charge_id,
          created: item.created,
          updated: item.updated,
        })),
      };

      if (list2.items.length > 0) {
        logger.info('✅ Record found in Query 2');
        debugResult.success = true;
      } else {
        logger.warn('⚠️ Query 2 returned empty list');
      }
    } catch (error2) {
      logger.error('❌ Query 2 failed', {
        filter: filterQuery2,
        errorMessage: error2.message,
        errorCode: error2.code,
        errorStatus: error2.status,
      });

      debugResult.queries.query2.error = {
        message: error2.message,
        code: error2.code,
        status: error2.status,
      };
      debugResult.errors.push(`Query 2 Error: ${error2.message}`);
    }

    // ============================================================
    // QUERY 3: getList without filter (get ALL records)
    // ============================================================
    logger.info('\n🔍 QUERY 3: Testing getList without filter (get ALL vip_customers)');

    debugResult.queries.query3 = {
      method: 'getList',
      page: 1,
      perPage: 50,
      filter: 'none',
      result: null,
      error: null,
    };

    try {
      logger.info('📡 Calling pb.collection("vip_customers").getList(1, 50)');

      const list3 = await pb.collection('vip_customers').getList(1, 50);

      logger.info('✅ Query 3 successful', {
        totalItems: list3.totalItems,
        itemsCount: list3.items.length,
        page: list3.page,
        perPage: list3.perPage,
      });

      debugResult.queries.query3.result = {
        totalItems: list3.totalItems,
        page: list3.page,
        perPage: list3.perPage,
        itemsCount: list3.items.length,
      };

      // Store all records
      debugResult.allRecords = list3.items.map(item => ({
        id: item.id,
        email: item.email,
        status: item.status,
        expiration_date: item.expiration_date,
        next_billing_date: item.next_billing_date,
        auto_renewal: item.auto_renewal,
        license_key: item.license_key,
        purchase_date: item.purchase_date,
        last_charge_id: item.last_charge_id,
        created: item.created,
        updated: item.updated,
      }));

      logger.info('📋 All VIP customers retrieved', {
        totalCount: list3.totalItems,
        recordsReturned: list3.items.length,
      });

      // Log each record for debugging
      list3.items.forEach((item, index) => {
        logger.info(`  Record ${index + 1}:`, {
          id: item.id,
          email: item.email,
          status: item.status,
          expirationDate: item.expiration_date,
        });
      });
    } catch (error3) {
      logger.error('❌ Query 3 failed', {
        errorMessage: error3.message,
        errorCode: error3.code,
        errorStatus: error3.status,
      });

      debugResult.queries.query3.error = {
        message: error3.message,
        code: error3.code,
        status: error3.status,
      };
      debugResult.errors.push(`Query 3 Error: ${error3.message}`);
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    logger.info('\n📊 VIP Debug Summary');
    logger.info('✅ Query 1 (getFirstListItem):', debugResult.queries.query1.error ? '❌ FAILED' : '✅ SUCCESS');
    logger.info('✅ Query 2 (getList with filter):', debugResult.queries.query2.error ? '❌ FAILED' : '✅ SUCCESS');
    logger.info('✅ Query 3 (getList all):', debugResult.queries.query3.error ? '❌ FAILED' : '✅ SUCCESS');
    logger.info('📋 Total VIP customers in database:', debugResult.allRecords.length);
    logger.info('🔍 Searching for email:', normalizedEmail);
    logger.info('✅ Record found:', debugResult.success);

    if (debugResult.errors.length > 0) {
      logger.warn('⚠️ Errors encountered:', debugResult.errors);
    }

    logger.info('\n✅ VIP Debug endpoint completed successfully');

    res.json(debugResult);
  } catch (error) {
    logger.error('❌ VIP Debug endpoint error', {
      email: normalizedEmail,
      errorMessage: error.message,
      errorCode: error.code,
      errorStatus: error.status,
      errorStack: error.stack,
    });

    debugResult.errors.push(`Endpoint Error: ${error.message}`);
    debugResult.success = false;

    res.status(500).json(debugResult);
  }
});

export default router;