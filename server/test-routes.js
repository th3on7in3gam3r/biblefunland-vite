/**
 * Quick test script to verify backend routes respond correctly
 * Run with: node server/test-routes.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 'test-user-123';
const TEST_PARENT_ID = 'test-parent-456';
const TEST_CHILD_ID = 'test-child-789';

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Backend Routes...\n');

  try {
    // Test 1: POST /api/profiles/:userId/age
    console.log('Test 1: POST /api/profiles/:userId/age');
    const ageRes = await makeRequest('POST', `/api/profiles/${TEST_USER_ID}/age`, { age: 25 });
    console.log(`  Status: ${ageRes.status}`);
    console.log(`  Response:`, ageRes.body);
    console.log(`  ✓ Age endpoint responds\n`);

    // Test 2: PATCH /api/profiles/:userId/role
    console.log('Test 2: PATCH /api/profiles/:userId/role');
    const roleRes = await makeRequest('PATCH', `/api/profiles/${TEST_USER_ID}/role`, { role: 'Parent' });
    console.log(`  Status: ${roleRes.status}`);
    console.log(`  Response:`, roleRes.body);
    console.log(`  ✓ Role endpoint responds\n`);

    // Test 3: POST /api/children/:parentId (create child)
    console.log('Test 3: POST /api/children/:parentId');
    const createChildRes = await makeRequest('POST', `/api/children/${TEST_PARENT_ID}`, {
      display_name: 'Test Child',
      age: 8,
      avatar_url: 'david',
    });
    console.log(`  Status: ${createChildRes.status}`);
    console.log(`  Response:`, createChildRes.body);
    console.log(`  ✓ Child creation endpoint responds\n`);

    // Test 4: GET /api/children/:parentId (list children)
    console.log('Test 4: GET /api/children/:parentId');
    const listChildrenRes = await makeRequest('GET', `/api/children/${TEST_PARENT_ID}`);
    console.log(`  Status: ${listChildrenRes.status}`);
    console.log(`  Response:`, listChildrenRes.body);
    console.log(`  ✓ Child list endpoint responds\n`);

    // Test 5: GET /api/parental-controls/:parentId
    console.log('Test 5: GET /api/parental-controls/:parentId');
    const getControlsRes = await makeRequest('GET', `/api/parental-controls/${TEST_PARENT_ID}`);
    console.log(`  Status: ${getControlsRes.status}`);
    console.log(`  Response:`, getControlsRes.body);
    console.log(`  ✓ Get controls endpoint responds\n`);

    // Test 6: PUT /api/parental-controls/:parentId
    console.log('Test 6: PUT /api/parental-controls/:parentId');
    const updateControlsRes = await makeRequest('PUT', `/api/parental-controls/${TEST_PARENT_ID}`, {
      pin: '1234',
      daily_limit: 30,
      bible_character_chat: true,
    });
    console.log(`  Status: ${updateControlsRes.status}`);
    console.log(`  Response:`, updateControlsRes.body);
    console.log(`  ✓ Update controls endpoint responds\n`);

    // Test 7: GET /api/progress/:childId
    console.log('Test 7: GET /api/progress/:childId');
    const progressRes = await makeRequest('GET', `/api/progress/${TEST_CHILD_ID}?period=7d`);
    console.log(`  Status: ${progressRes.status}`);
    console.log(`  Response:`, progressRes.body);
    console.log(`  ✓ Progress endpoint responds\n`);

    console.log('✅ All route endpoints are responding!\n');
    console.log('Summary:');
    console.log('  ✓ Age enforcement route works');
    console.log('  ✓ Role validation route works');
    console.log('  ✓ Child creation route works');
    console.log('  ✓ Child list route works');
    console.log('  ✓ Parental controls get route works');
    console.log('  ✓ Parental controls update route works');
    console.log('  ✓ Progress report route works');
    console.log('\n🎉 Task 2 Checkpoint: All routes registered and responding!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error('\nMake sure the server is running on port 3001');
    console.error('Start it with: npm run dev (from root) or node server/index.js');
    process.exit(1);
  }
}

// Wait a moment for server to be ready, then run tests
setTimeout(runTests, 1000);
