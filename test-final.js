const https = require('https');

console.log('Backend Deployment Status Test\n' + '='.repeat(50) + '\n');

const backends = [
  {
    name: 'movies-space-backend (official)',
    host: 'movies-space-backend-saurav-kumars-projects-11451f66.vercel.app'
  },
  {
    name: 'backend-kappa-neon',
    host: 'backend-kappa-neon-12.vercel.app'
  }
];

let completed = 0;
const results = [];

backends.forEach(backend => {
  const options = {
    hostname: backend.host,
    path: '/api/v1/health',
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    timeout: 5000
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      completed++;
      const result = {
        name: backend.name,
        url: `https://${backend.host}`,
        status: res.statusCode,
        success: res.statusCode === 200
      };
      
      if (res.statusCode === 200) {
        try {
          result.response = JSON.parse(data);
        } catch(e) {
          result.response = data.substring(0, 100);
        }
      }
      
      results.push(result);
      
      if (completed === backends.length) {
        displayResults(results);
      }
    });
  });

  req.on('timeout', () => {
    completed++;
    results.push({
      name: backend.name,
      url: `https://${backend.host}`,
      status: 'TIMEOUT',
      success: false
    });
    req.destroy();
    if (completed === backends.length) displayResults(results);
  });

  req.on('error', (error) => {
    completed++;
    results.push({
      name: backend.name,
      url: `https://${backend.host}`,
      status: 'ERROR: ' + (error.code || error.message),
      success: false
    });
    if (completed === backends.length) displayResults(results);
  });

  req.end();
});

function displayResults(results) {
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.name}`);
    console.log(`   URL: ${r.url}`);
    console.log(`   Status: ${r.status}`);
    if (r.response) {
      if (typeof r.response === 'string') {
        console.log(`   Response: ${r.response}`);
      } else {
        console.log(`   Response: ${JSON.stringify(r.response).substring(0, 150)}`);
      }
    }
    console.log();
  });
  
  const anySuccess = results.some(r => r.success);
  if (anySuccess) {
    console.log('\n✅ At least one backend is responding!');
  } else {
    console.log('\n⏳ Backends still deploying or experiencing issues');
    console.log('   Please wait 2-3 more minutes and retry');
  }
}

setTimeout(() => {
  if (completed < backends.length) {
    console.log('❌ Test timeout - some backends did not respond');
    process.exit(1);
  }
}, 12000);
