import net from 'net';

/**
 * Mock Motor Controller Server
 * This simulates the motor controller that receives commands
 */

const PORT = parseInt(process.env.MOCK_MOTOR_PORT || '8888');
const HOST = '0.0.0.0';

console.log(`🤖 Mock Motor Controller Starting...`);
console.log(`📡 Listening on ${HOST}:${PORT}`);
console.log(`\nWaiting for commands...\n`);

const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`✅ Client connected from ${clientAddress}`);

  socket.on('data', (data) => {
    try {
      // Parse the incoming command
      const command = JSON.parse(data.toString());
      console.log(`📥 Received command from ${clientAddress}:`);
      console.log(`   Command: ${command.command}`);
      console.log(`   Amount: ${command.amount || 1}`);
      console.log(`   Raw data: ${data.toString()}`);
      
      // Simulate processing
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
      
      // Send response back
      socket.write(JSON.stringify(response));
      console.log(`📤 Sent response: ${JSON.stringify(response)}\n`);
      
    } catch (error) {
      console.error(`❌ Error processing command: ${error}`);
      socket.write(JSON.stringify({ 
        success: false, 
        error: 'Invalid command format' 
      }));
    }
  });

  socket.on('error', (err) => {
    console.error(`❌ Socket error from ${clientAddress}: ${err.message}`);
  });

  socket.on('close', () => {
    console.log(`👋 Client ${clientAddress} disconnected\n`);
  });
});

server.on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Mock Motor Controller is ready!`);
  console.log(`\n💡 To test, make sure your backend .env file has:`);
  console.log(`   MOTOR_CONTROLLER_IP=localhost`);
  console.log(`   MOTOR_CONTROLLER_PORT=${PORT}`);
  console.log(`\n📝 Press Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Mock Motor Controller...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
