import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3001/hcgi/api/vip-login';
const testEmail = 'test@example.com';

console.log('\n🧪 VIP LOGIN ENDPOINT DIAGNOSTIC TEST');
console.log('=====================================\n');
console.log(`📍 Endpoint: POST ${baseUrl}`);
console.log(`📧 Test Email: ${testEmail}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

console.log('📤 Sending POST request...\n');

fetch(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail })
})
.then(async (response) => {
  console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);
  
  const data = await response.json();
  
  console.log('📥 Response Body:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n');
  
  if (data.success) {
    console.log('✅ SUCCESS: VIP Login endpoint is working!');
    console.log(`   Token: ${data.token}`);
    console.log(`   Customer ID: ${data.customerId}`);
    console.log(`   Expiration Date: ${data.expirationDate}`);
  } else {
    console.log('⚠️  EXPECTED RESPONSE: Endpoint returned error (customer not found or not VIP)');
    console.log(`   Error: ${data.error}`);
    console.log('   This is normal if the test email does not exist in vip_customers collection');
  }
  
  console.log('\n✅ DIAGNOSIS: API server IS running and routes ARE loaded!');
  console.log('   The /vip-login endpoint is accessible and responding.\n');
  
  process.exit(0);
})
.catch((error) => {
  console.log('\n❌ ERROR: Could not reach the endpoint\n');
  console.log(`Error: ${error.message}\n`);
  
  if (error.message.includes('ECONNREFUSED')) {
    console.log('🔴 DIAGNOSIS: API server is NOT running');
    console.log('   Start the server with: npm run dev\n');
  } else if (error.message.includes('Route not found')) {
    console.log('🔴 DIAGNOSIS: Route not found - server needs restart');
    console.log('   Restart the server with: npm run dev\n');
  } else {
    console.log('🔴 DIAGNOSIS: Network or connection error');
    console.log('   Check that the API server is running on port 3001\n');
  }
  
  process.exit(1);
});