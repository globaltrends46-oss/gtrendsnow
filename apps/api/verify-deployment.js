import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3001/hcgi/api';
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200,
    expectedFields: ['status'],
  },
  {
    name: 'Test Route',
    method: 'GET',
    path: '/test',
    expectedStatus: 200,
    expectedFields: ['success', 'message', 'timestamp'],
  },
  {
    name: 'VIP Login',
    method: 'POST',
    path: '/vip-login',
    body: { email: 'test@example.com' },
    expectedStatus: 200,
    expectedFields: ['success', 'error'],
  },
];

console.log('\n🚀 DEPLOYMENT VERIFICATION TEST');
console.log('================================\n');
console.log(`📍 Base URL: ${baseUrl}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

let passCount = 0;
let failCount = 0;

const runTest = async (test) => {
  const url = baseUrl + test.path;
  const options = {
    method: test.method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (test.body) {
    options.body = JSON.stringify(test.body);
  }

  try {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`   ${test.method} ${test.path}`);

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);

    // Check status code
    if (response.status !== test.expectedStatus) {
      console.log(`   ❌ FAILED: Expected status ${test.expectedStatus}, got ${response.status}`);
      failCount++;
      return false;
    }

    // Check expected fields
    let allFieldsPresent = true;
    for (const field of test.expectedFields) {
      if (!(field in data)) {
        console.log(`   ❌ FAILED: Missing field '${field}' in response`);
        allFieldsPresent = false;
      }
    }

    if (!allFieldsPresent) {
      failCount++;
      return false;
    }

    console.log(`   ✅ PASSED`);
    console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    passCount++;
    return true;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    failCount++;
    return false;
  }
};

(async () => {
  for (const test of tests) {
    await runTest(test);
    console.log();
  }

  console.log('================================');
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed\n`);

  if (failCount === 0) {
    console.log('✅ DEPLOYMENT VERIFICATION SUCCESSFUL');
    console.log('   All endpoints are responding correctly');
    console.log('   API server is running with all routes loaded');
    console.log('   Ready for production use\n');
    process.exit(0);
  } else {
    console.log('❌ DEPLOYMENT VERIFICATION FAILED');
    console.log('   Some endpoints are not responding correctly');
    console.log('   Check server logs for details\n');
    process.exit(1);
  }
})();