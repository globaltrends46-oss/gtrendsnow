import 'dotenv/config';
import logger from './logger.js';

/**
 * Comprehensive test script for /generate-blog endpoint
 * Captures all detailed logs including authentication, errors, and response data
 * Usage: node src/utils/test-generate-blog-with-logs.js
 */

function getTimestamp() {
  return new Date().toISOString();
}

function logWithTimestamp(level, message, data = null) {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}]`;
  
  if (data) {
    console.log(`${prefix} ${level} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${level} ${message}`);
  }
}

async function testGenerateBlogWithLogs() {
  const baseUrl = 'http://localhost:3001/hcgi/api/generate-blog';
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'SecureAdminPass123!';

  logWithTimestamp('INFO', '===================================================================');
  logWithTimestamp('INFO', 'GENERATE-BLOG ENDPOINT TEST WITH DETAILED LOGGING');
  logWithTimestamp('INFO', '===================================================================');
  logWithTimestamp('INFO', '');

  logWithTimestamp('INFO', 'TEST CONFIGURATION:');
  logWithTimestamp('INFO', `  Endpoint URL: ${baseUrl}`);
  logWithTimestamp('INFO', `  Admin Email: ${adminEmail}`);
  logWithTimestamp('INFO', `  Admin Password Length: ${adminPassword.length} characters`);
  logWithTimestamp('INFO', `  PocketBase URL: ${process.env.POCKETBASE_URL || 'http://localhost:8090'}`);
  logWithTimestamp('INFO', '');

  logWithTimestamp('INFO', 'ENVIRONMENT VARIABLES CHECK:');
  const envVars = {
    'POCKETBASE_ADMIN_EMAIL': process.env.POCKETBASE_ADMIN_EMAIL,
    'POCKETBASE_ADMIN_PASSWORD': process.env.POCKETBASE_ADMIN_PASSWORD ? '***SET***' : 'NOT SET',
    'POCKETBASE_URL': process.env.POCKETBASE_URL || 'http://localhost:8090 (default)',
    'PORT': process.env.PORT || '3001 (default)',
  };
  logWithTimestamp('INFO', '', envVars);
  logWithTimestamp('INFO', '');

  if (!adminEmail || !adminPassword) {
    logWithTimestamp('ERROR', 'Missing admin credentials in environment variables');
    logWithTimestamp('ERROR', 'Please ensure POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are set in .env');
    return {
      success: false,
      error: 'Missing admin credentials',
      timestamp: getTimestamp(),
    };
  }

  try {
    logWithTimestamp('INFO', 'STARTING REQUEST TO /generate-blog ENDPOINT');
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'Preparing POST request...');
    logWithTimestamp('INFO', `  Method: POST`);
    logWithTimestamp('INFO', `  URL: ${baseUrl}`);
    logWithTimestamp('INFO', `  Headers: Content-Type: application/json`);
    logWithTimestamp('INFO', `  Body: {}`);
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'Sending request... (this may take 1-2 minutes for AI to generate content)');
    const startTime = Date.now();

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    logWithTimestamp('INFO', '');
    logWithTimestamp('INFO', `RESPONSE RECEIVED (${duration}s)`);
    logWithTimestamp('INFO', `  Status Code: ${response.status}`);
    logWithTimestamp('INFO', `  Status Text: ${response.statusText}`);
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'RESPONSE HEADERS:');
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    logWithTimestamp('INFO', '', headers);
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'Parsing response body...');
    const data = await response.json();
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'RESPONSE BODY:');
    logWithTimestamp('INFO', '', data);
    logWithTimestamp('INFO', '');

    if (response.ok && data.success) {
      logWithTimestamp('SUCCESS', '===================================================================');
      logWithTimestamp('SUCCESS', 'SUCCESS: Blog post generated and published!');
      logWithTimestamp('SUCCESS', '===================================================================');
      logWithTimestamp('INFO', '');

      logWithTimestamp('INFO', 'BLOG POST DETAILS:');
      logWithTimestamp('INFO', `  Post ID: ${data.postId}`);
      logWithTimestamp('INFO', `  Title: ${data.title}`);
      logWithTimestamp('INFO', `  Region: ${data.region}`);
      logWithTimestamp('INFO', `  Published Date: ${data.publishedDate}`);
      logWithTimestamp('INFO', `  Content Length: ${data.contentLength} characters`);
      logWithTimestamp('INFO', `  Featured Image URL: ${data.featuredImageUrl || 'Not generated'}`);
      logWithTimestamp('INFO', `  Message: ${data.message}`);
      logWithTimestamp('INFO', '');

      logWithTimestamp('SUCCESS', 'Blog post is now live in PocketBase!');
      logWithTimestamp('INFO', '');

      return {
        success: true,
        status: response.status,
        postId: data.postId,
        title: data.title,
        region: data.region,
        publishedDate: data.publishedDate,
        contentLength: data.contentLength,
        featuredImageUrl: data.featuredImageUrl,
        duration: `${duration}s`,
        timestamp: getTimestamp(),
      };
    }

    if (!response.ok || !data.success) {
      logWithTimestamp('ERROR', '===================================================================');
      logWithTimestamp('ERROR', 'FAILED: Request returned an error');
      logWithTimestamp('ERROR', '===================================================================');
      logWithTimestamp('INFO', '');

      logWithTimestamp('INFO', 'ERROR DETAILS:');
      logWithTimestamp('INFO', `  HTTP Status: ${response.status} ${response.statusText}`);
      logWithTimestamp('INFO', `  Error Message: ${data.error}`);
      logWithTimestamp('INFO', `  Error Type: ${data.errorType || 'Unknown'}`);
      logWithTimestamp('INFO', `  Admin User Exists: ${data.adminUserExists !== undefined ? data.adminUserExists : 'Unknown'}`);
      logWithTimestamp('INFO', `  Details: ${data.details || 'No additional details'}`);
      logWithTimestamp('INFO', '');

      logWithTimestamp('INFO', 'COMPLETE ERROR RESPONSE:');
      logWithTimestamp('INFO', '', data);
      logWithTimestamp('INFO', '');

      logWithTimestamp('INFO', 'DEBUGGING SUGGESTIONS:');
      logWithTimestamp('INFO', '');

      if (data.errorType === 'Invalid credentials') {
        logWithTimestamp('INFO', '  ERROR: Invalid Credentials');
        logWithTimestamp('INFO', '  Possible causes:');
        logWithTimestamp('INFO', '    1. Admin password in .env is incorrect');
        logWithTimestamp('INFO', '    2. Admin user password was changed in PocketBase');
        logWithTimestamp('INFO', '  Next steps:');
        logWithTimestamp('INFO', '    1. Verify POCKETBASE_ADMIN_PASSWORD in apps/api/.env');
        logWithTimestamp('INFO', '    2. Check PocketBase admin panel for correct password');
        logWithTimestamp('INFO', '    3. Update .env with correct password and restart server');
      } else if (data.errorType === 'User not found') {
        logWithTimestamp('INFO', '  ERROR: Admin User Not Found');
        logWithTimestamp('INFO', '  Possible causes:');
        logWithTimestamp('INFO', '    1. Admin user does not exist in PocketBase');
        logWithTimestamp('INFO', '    2. Admin email in .env is incorrect');
        logWithTimestamp('INFO', '  Next steps:');
        logWithTimestamp('INFO', '    1. Check PocketBase admin panel for admin users');
        logWithTimestamp('INFO', '    2. Verify POCKETBASE_ADMIN_EMAIL in apps/api/.env');
        logWithTimestamp('INFO', '    3. Create admin user if it does not exist');
      } else if (data.errorType === 'Connection error') {
        logWithTimestamp('INFO', '  ERROR: PocketBase Connection Error');
        logWithTimestamp('INFO', '  Possible causes:');
        logWithTimestamp('INFO', '    1. PocketBase server is not running');
        logWithTimestamp('INFO', '    2. PocketBase URL in .env is incorrect');
        logWithTimestamp('INFO', '    3. Network connectivity issue');
        logWithTimestamp('INFO', '  Next steps:');
        logWithTimestamp('INFO', '    1. Start PocketBase server');
        logWithTimestamp('INFO', '    2. Verify POCKETBASE_URL in apps/api/.env');
        logWithTimestamp('INFO', '    3. Check network connectivity');
      } else {
        logWithTimestamp('INFO', '  ERROR: Unknown Error');
        logWithTimestamp('INFO', '  Error message: ' + data.error);
        logWithTimestamp('INFO', '  Next steps:');
        logWithTimestamp('INFO', '    1. Check server logs for detailed error information');
        logWithTimestamp('INFO', '    2. Verify all environment variables are set correctly');
        logWithTimestamp('INFO', '    3. Check PocketBase and API server are running');
      }

      logWithTimestamp('INFO', '');
      logWithTimestamp('INFO', 'SERVER LOGS TO CHECK:');
      logWithTimestamp('INFO', '  1. API Server logs (npm run dev output)');
      logWithTimestamp('INFO', '  2. PocketBase logs');
      logWithTimestamp('INFO', '  3. Look for lines containing:');
      logWithTimestamp('INFO', '     - "Attempting to authenticate with email:"');
      logWithTimestamp('INFO', '     - "Password length:"');
      logWithTimestamp('INFO', '     - "PocketBase URL:"');
      logWithTimestamp('INFO', '     - "Authentication failed:"');
      logWithTimestamp('INFO', '     - "Admin user exists:"');
      logWithTimestamp('INFO', '');

      return {
        success: false,
        status: response.status,
        error: data.error,
        errorType: data.errorType,
        adminUserExists: data.adminUserExists,
        duration: `${duration}s`,
        timestamp: getTimestamp(),
      };
    }
  } catch (error) {
    logWithTimestamp('ERROR', '===================================================================');
    logWithTimestamp('ERROR', 'EXCEPTION: Error during request');
    logWithTimestamp('ERROR', '===================================================================');
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'EXCEPTION DETAILS:');
    logWithTimestamp('INFO', `  Error Message: ${error.message}`);
    logWithTimestamp('INFO', `  Error Type: ${error.constructor.name}`);
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'STACK TRACE:');
    logWithTimestamp('INFO', '', { stack: error.stack });
    logWithTimestamp('INFO', '');

    logWithTimestamp('INFO', 'DEBUGGING SUGGESTIONS:');
    logWithTimestamp('INFO', '');

    if (error.message.includes('ECONNREFUSED')) {
      logWithTimestamp('INFO', '  ERROR: Connection Refused');
      logWithTimestamp('INFO', '  The API server is not running or not accessible');
      logWithTimestamp('INFO', '  Next steps:');
      logWithTimestamp('INFO', '    1. Start the API server: npm run dev');
      logWithTimestamp('INFO', '    2. Verify server is running on http://localhost:3001');
      logWithTimestamp('INFO', '    3. Check for any startup errors in the server logs');
    } else if (error.message.includes('fetch')) {
      logWithTimestamp('INFO', '  ERROR: Network/Fetch Error');
      logWithTimestamp('INFO', '  Could not reach the API endpoint');
      logWithTimestamp('INFO', '  Next steps:');
      logWithTimestamp('INFO', '    1. Verify API server is running');
      logWithTimestamp('INFO', '    2. Check endpoint URL: http://localhost:3001/hcgi/api/generate-blog');
      logWithTimestamp('INFO', '    3. Check network connectivity');
    } else {
      logWithTimestamp('INFO', '  ERROR: Unexpected Error');
      logWithTimestamp('INFO', '  Error: ' + error.message);
      logWithTimestamp('INFO', '  Next steps:');
      logWithTimestamp('INFO', '    1. Check the stack trace above');
      logWithTimestamp('INFO', '    2. Review server logs for more details');
      logWithTimestamp('INFO', '    3. Verify all dependencies are installed');
    }

    logWithTimestamp('INFO', '');

    return {
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      timestamp: getTimestamp(),
    };
  }
}

logWithTimestamp('INFO', 'Test script started at ' + getTimestamp());
logWithTimestamp('INFO', '');

testGenerateBlogWithLogs().then(result => {
  logWithTimestamp('INFO', '');
  logWithTimestamp('INFO', '===================================================================');
  logWithTimestamp('INFO', 'TEST SUMMARY');
  logWithTimestamp('INFO', '===================================================================');
  logWithTimestamp('INFO', '', result);
  logWithTimestamp('INFO', '');
  logWithTimestamp('INFO', 'Test script completed at ' + getTimestamp());
  logWithTimestamp('INFO', '');
  process.exit(result.success ? 0 : 1);
});