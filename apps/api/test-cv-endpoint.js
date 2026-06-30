import 'dotenv/config';
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3001/hcgi/api/generate-cv';

const testData = {
  name: 'Test User',
  experience: '5 years as Senior Developer at Tech Corp, 3 years as Full Stack Engineer at StartupXYZ',
  skills: 'JavaScript, React, Node.js, TypeScript, MongoDB, AWS',
  education: 'BS Computer Science from State University (2018)',
};

console.log('\n' + '='.repeat(80));
console.log('🧪 CV ENDPOINT TEST');
console.log('='.repeat(80));
console.log('\n📍 Endpoint: POST /hcgi/api/generate-cv');
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('\n📦 Request Body:');
console.log(JSON.stringify(testData, null, 2));

console.log('\n📤 Sending POST request...');
console.log('⏳ This may take 10-30 seconds for Gemini API to generate content...\n');

const startTime = Date.now();

fetch(baseUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(async (response) => {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('📥 RESPONSE RECEIVED');
    console.log('='.repeat(80));
    console.log('\n📊 Response Status:', response.status, response.statusText);
    console.log('⏱️  Duration:', duration, 'seconds');
    console.log('\n📋 Response Headers:');
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  Content-Length:', response.headers.get('content-length'));

    const data = await response.json();

    console.log('\n📥 Response Body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n' + '='.repeat(80));
      console.log('✅ SUCCESS: CV ENDPOINT WORKING');
      console.log('='.repeat(80));
      console.log('\n✅ CV generated successfully!');
      console.log('\n📋 Generated CV Details:');
      console.log('  Name:', data.name);
      console.log('  CV Length:', data.generatedCV.length, 'characters');
      console.log('  CV Preview:');
      console.log('  ' + data.generatedCV.substring(0, 300) + '...');
      console.log('\n✅ The /generate-cv endpoint is fully operational!');
      console.log('\n');
      process.exit(0);
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('❌ FAILED: CV ENDPOINT ERROR');
      console.log('='.repeat(80));
      console.log('\n❌ Endpoint returned an error response');
      console.log('\n📋 Error Details:');
      console.log('  Success:', data.success);
      console.log('  Error:', data.error);
      console.log('  Error Type:', data.errorType || 'Unknown');
      console.log('  Details:', data.details || 'No additional details');

      if (data.errorType === 'Invalid API Key') {
        console.log('\n🔴 ROOT CAUSE: GEMINI_API_KEY is invalid or expired');
        console.log('\n🔧 SOLUTION:');
        console.log('  1. Check apps/api/.env for GEMINI_API_KEY');
        console.log('  2. Verify the key is valid and not expired');
        console.log('  3. Get a new key from: https://aistudio.google.com/app/apikey');
        console.log('  4. Update GEMINI_API_KEY in apps/api/.env');
        console.log('  5. Restart the API server: npm run dev');
      } else if (data.errorType === 'API Quota Exceeded') {
        console.log('\n🔴 ROOT CAUSE: Gemini API quota exceeded');
        console.log('\n🔧 SOLUTION:');
        console.log('  1. Wait a few minutes and try again');
        console.log('  2. Check your Gemini API usage at: https://aistudio.google.com/app/apikey');
        console.log('  3. Upgrade your API plan if needed');
      } else if (data.errorType === 'Rate Limited') {
        console.log('\n🔴 ROOT CAUSE: API rate limit exceeded');
        console.log('\n🔧 SOLUTION:');
        console.log('  1. Wait a few minutes before trying again');
        console.log('  2. Reduce the frequency of API calls');
      } else if (data.errorType === 'Network Error') {
        console.log('\n🔴 ROOT CAUSE: Cannot connect to Gemini API');
        console.log('\n🔧 SOLUTION:');
        console.log('  1. Check your internet connection');
        console.log('  2. Verify Gemini API is accessible');
        console.log('  3. Check firewall/proxy settings');
      }

      console.log('\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('❌ EXCEPTION: REQUEST FAILED');
    console.log('='.repeat(80));
    console.log('\n❌ Exception occurred during request');
    console.log('\n📋 Error Details:');
    console.log('  Error Message:', error.message);
    console.log('  Error Type:', error.constructor.name);
    console.log('  Duration:', duration, 'seconds');
    console.log('  Stack:', error.stack);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔴 ROOT CAUSE: API server is not running');
      console.log('\n🔧 SOLUTION:');
      console.log('  1. Start the API server: npm run dev');
      console.log('  2. Wait for the server to start on port 3001');
      console.log('  3. Run this test again');
    } else if (error.message.includes('fetch')) {
      console.log('\n🔴 ROOT CAUSE: Network error connecting to API');
      console.log('\n🔧 SOLUTION:');
      console.log('  1. Verify API server is running on http://localhost:3001');
      console.log('  2. Check your network connection');
      console.log('  3. Check firewall settings');
    } else {
      console.log('\n🔴 ROOT CAUSE: Unexpected error');
      console.log('\n🔧 SOLUTION:');
      console.log('  1. Check the error message above');
      console.log('  2. Review server logs for more details');
      console.log('  3. Verify all dependencies are installed: npm install');
    }

    console.log('\n');
    process.exit(1);
  });