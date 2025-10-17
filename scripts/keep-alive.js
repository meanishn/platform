#!/usr/bin/env node

/**
 * Keep-Alive Service
 * 
 * Pings the health endpoint to prevent cold starts on free tier services.
 * Can be run as:
 * 1. Cron job on external service (cron-job.org, GitHub Actions, etc.)
 * 2. Local cron for testing
 * 
 * Usage:
 *   node scripts/keep-alive.js
 *   node scripts/keep-alive.js https://your-api.onrender.com
 */

const https = require('https');
const http = require('http');

// Get URL from command line argument or environment variable
const API_URL = process.argv[2] || process.env.API_URL || process.env.RENDER_EXTERNAL_URL;

if (!API_URL) {
  console.error('❌ Error: No API URL provided');
  console.error('Usage: node keep-alive.js <url>');
  console.error('Example: node keep-alive.js https://platform-api.onrender.com');
  process.exit(1);
}

// Parse URL to determine protocol
const healthUrl = API_URL.endsWith('/health') ? API_URL : `${API_URL}/health`;
const isHttps = healthUrl.startsWith('https');
const httpModule = isHttps ? https : http;

console.log(`🏓 Pinging ${healthUrl}...`);

const startTime = Date.now();

httpModule.get(healthUrl, (res) => {
  const duration = Date.now() - startTime;
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const health = JSON.parse(data);
        console.log('✅ Server is alive!');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response time: ${duration}ms`);
        console.log(`   Uptime: ${Math.floor(health.uptime)}s`);
        console.log(`   Timestamp: ${health.timestamp}`);
        process.exit(0);
      } catch (e) {
        console.log('✅ Server responded (200 OK)');
        console.log(`   Response time: ${duration}ms`);
        process.exit(0);
      }
    } else {
      console.error(`❌ Server returned ${res.statusCode}`);
      console.error(`   Response: ${data.substring(0, 200)}`);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  const duration = Date.now() - startTime;
  console.error(`❌ Request failed after ${duration}ms`);
  console.error(`   Error: ${err.message}`);
  
  if (err.code === 'ENOTFOUND') {
    console.error('   Hint: Check if the URL is correct');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('   Hint: Server might be down or starting up');
  }
  
  process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Request timeout (30s)');
  console.error('   Server might be cold starting (this is normal on free tier)');
  process.exit(1);
}, 30000);

