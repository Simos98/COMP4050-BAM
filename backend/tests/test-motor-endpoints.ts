import axios from 'axios';

/**
 * Test script for Motor Control Endpoints
 * Run this after starting both the backend server and mock motor controller
 */

const API_BASE = 'http://localhost:3001/api/motor';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

async function testEndpoint(name: string, endpoint: string, data: any) {
  console.log(`\n${colors.blue}Testing: ${name}${colors.reset}`);
  console.log(`Endpoint: POST ${endpoint}`);
  console.log(`Request body:`, data);
  
  try {
    const response = await axios.post(endpoint, data);
    console.log(`${colors.green}✅ Success!${colors.reset}`);
    console.log(`Response:`, response.data);
    return true;
  } catch (error: any) {
    console.log(`${colors.red}❌ Failed!${colors.reset}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error:`, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`Error: Cannot connect to backend server at ${API_BASE}`);
      console.log(`Make sure the backend is running!`);
    } else {
      console.log(`Error:`, error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log(`${colors.yellow}🧪 Motor Control Endpoint Tests${colors.reset}`);
  console.log(`================================`);
  
  const tests = [
    {
      name: 'Move X Motor (10 steps)',
      endpoint: `${API_BASE}/move-x`,
      data: { amount: 10 }
    },
    {
      name: 'Move Y Motor (5 steps)',
      endpoint: `${API_BASE}/move-y`,
      data: { amount: 5 }
    },
    {
      name: 'Zoom In (3 steps)',
      endpoint: `${API_BASE}/zoom-in`,
      data: { amount: 3 }
    },
    {
      name: 'Zoom Out (default 1 step)',
      endpoint: `${API_BASE}/zoom-out`,
      data: {} // Testing default amount
    },
    {
      name: 'Generic Command - Move X',
      endpoint: `${API_BASE}/command`,
      data: { command: 'move_x', amount: 7 }
    },
    {
      name: 'Generic Command - Zoom In Fine',
      endpoint: `${API_BASE}/command`,
      data: { command: 'zoom_in_fine' } // Testing with default amount
    },
    {
      name: 'Invalid Command Test',
      endpoint: `${API_BASE}/command`,
      data: { command: 'invalid_command', amount: 1 }
    },
    {
      name: 'Invalid Amount Test',
      endpoint: `${API_BASE}/move-x`,
      data: { amount: -5 } // Negative amount should fail
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.endpoint, test.data);
    if (result) passed++;
    else failed++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${colors.yellow}Test Summary${colors.reset}`);
  console.log(`============`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${tests.length}`);
}

// Check if axios is installed
try {
  require.resolve('axios');
} catch (e) {
  console.log(`${colors.red}❌ axios is not installed!${colors.reset}`);
  console.log(`Please run: cd backend && npm install axios --save-dev`);
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);
