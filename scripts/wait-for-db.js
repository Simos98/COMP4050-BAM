const { exec } = require('child_process');

async function waitForDatabase() {
  console.log('⏳ Waiting for database to be ready...');
  
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await execPromise('docker-compose exec -T postgres pg_isready -U comp4050_user -d comp4050_db');
      console.log('✅ Database is ready!');
      return;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('❌ Database failed to start after 30 attempts');
        console.error('Try running: docker-compose logs postgres');
        process.exit(1);
      }
      process.stdout.write(`⏳ Waiting... (${attempts}/${maxAttempts})\r`);
      await sleep(1000);
    }
  }
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if called directly
if (require.main === module) {
  waitForDatabase().catch(console.error);
}

module.exports = { waitForDatabase };
