import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3001/hcgi/api';

const routes = [
  { method: 'GET', path: '/health', name: 'Health Check' },
  { method: 'GET', path: '/test', name: 'Test Route' },
  { method: 'GET', path: '/vip-test', name: 'VIP Test' },
  { method: 'GET', path: '/vip-debug?email=test@example.com', name: 'VIP Debug' },
  { method: 'POST', path: '/vip-login', name: 'VIP Login', body: { email: 'test@example.com' } },
];

console.log('\n🧪 API ROUTES DIAGNOSTIC TEST');
console.log('==============================\n');
console.log(`🌐 Base URL: ${baseUrl}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

let successCount = 0;
let failureCount = 0;

const testRoute = async (route) => {
  const url = baseUrl + route.path;
  const options = {
    method: route.method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (route.body) {
    options.body = JSON.stringify(route.body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`✅ ${route.method.padEnd(4)} ${route.path.padEnd(40)} [${response.status}]`);
    successCount++;
    return true;
  } catch (error) {
    console.log(`❌ ${route.method.padEnd(4)} ${route.path.padEnd(40)} [ERROR: ${error.message}]`);
    failureCount++;
    return false;
  }
};

(async () => {
  for (const route of routes) {
    await testRoute(route);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${successCount} passed, ${failureCount} failed\n`);
  
  if (failureCount === 0) {
    console.log('✅ SUCCESS: All routes are accessible!');
    console.log('   API server is running and all routes are loaded.\n');
    process.exit(0);
  } else {
    console.log('❌ FAILURE: Some routes are not accessible');
    console.log('   Check that the API server is running: npm run dev\n');
    process.exit(1);
  }
})();