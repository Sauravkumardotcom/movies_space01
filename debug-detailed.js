const https = require('https');

const host = 'backend-kappa-neon-12.vercel.app';
const path = '/api/health';

console.log('Detailed Error Analysis\n' + '='.repeat(60) + '\n');

const options = {
  hostname: host,
  path: path,
  method: 'GET',
  timeout: 5000
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode} ${res.statusMessage}\n`);
  console.log('Response Headers:');
  console.log(JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\nResponse Body:');
    console.log(data);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(data);
      console.log('\n✅ Parsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch(e) {
      console.log('\n⚠️ Not JSON or parsing failed');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.end();
