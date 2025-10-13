const fs = require('fs');
const path = require('path');

function checkDependencies() {
  console.log('🔍 Checking dependencies...');
  
  const checks = [
    {
      name: 'Backend node_modules',
      path: 'backend/node_modules',
      required: true
    },
    {
      name: 'Frontend node_modules', 
      path: 'frontend/node_modules',
      required: false // Optional for backend-only development
    },
    {
      name: 'Root node_modules',
      path: 'node_modules',
      required: true
    }
  ];
  
  let allGood = true;
  
  for (const check of checks) {
    const exists = fs.existsSync(check.path);
    const status = exists ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`${status} ${check.name}: ${exists ? 'Found' : 'Missing'}`);
    
    if (!exists && check.required) {
      allGood = false;
    }
  }
  
  if (!allGood) {
    console.log('\n❌ Dependencies missing. Run: npm run setup');
    process.exit(1);
  }
  
  console.log('✅ All required dependencies found!');
}

checkDependencies();
