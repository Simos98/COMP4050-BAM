import express from 'express';
import { json } from 'express';

/**
 * Mock Motor Controller HTTP Server
 * This simulates the motor controller that receives HTTP commands at /send_command/
 */

const app = express();
app.use(json());

const PORT = parseInt(process.env.MOCK_MOTOR_PORT || '8888');

console.log(`🤖 Mock Motor Controller HTTP Server Starting...`);
console.log(`📡 Will listen on http://localhost:${PORT}/send_command/`);
console.log(`\nWaiting for commands...\n`);

// Handle POST requests to /send_command/
app.post('/send_command/', (req, res) => {
  const command = req.body;
  
  console.log(`📥 Received command at ${new Date().toISOString()}:`);
  console.log(`   Command: ${command.command}`);
  console.log(`   Amount: ${command.amount || 1}`);
  console.log(`   Full request body:`, JSON.stringify(command, null, 2));
  
  // Validate command
  const validCommands = ['move_x', 'move_y', 'zoom_in_fine', 'zoom_out_fine'];
  if (!command.command || !validCommands.includes(command.command)) {
    console.log(`❌ Invalid command received: ${command.command}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid command'
    });
  }
  
  // Simulate processing time
  setTimeout(() => {
    // Simulate a successful response
    const response = {
      success: true,
      message: `Command ${command.command} executed with amount ${command.amount || 1}`,
      executedAt: new Date().toISOString(),
      motorStatus: {
        x_position: Math.floor(Math.random() * 1000),
        y_position: Math.floor(Math.random() * 1000),
        zoom_level: Math.floor(Math.random() * 10)
      }
    };
    
    console.log(`📤 Sending response:`, JSON.stringify(response, null, 2));
    console.log('---\n');
    
    res.json(response);
  }, 100); // Simulate 100ms processing time
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mock Motor Controller is running',
    endpoint: '/send_command/'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Mock Motor Controller HTTP Server is ready!`);
  console.log(`\n💡 To test, make sure your backend .env file has:`);
  console.log(`   MOTOR_CONTROLLER_IP=localhost`);
  console.log(`   MOTOR_CONTROLLER_PORT=${PORT}`);
  console.log(`\n📝 Commands will be sent to: http://localhost:${PORT}/send_command/`);
  console.log(`\n📝 Press Ctrl+C to stop the server\n`);
});

// Handle server errors
app.on('error', (err: any) => {
  console.error(`❌ Server error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Mock Motor Controller...');
  process.exit(0);
});
