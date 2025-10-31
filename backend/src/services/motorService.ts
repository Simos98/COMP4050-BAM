import * as net from 'net';
import { config } from 'dotenv';

config();

// Get IP and port from environment variables with defaults
const MOTOR_CONTROLLER_IP = process.env.MOTOR_CONTROLLER_IP || '192.168.1.100';
const MOTOR_CONTROLLER_PORT = parseInt(process.env.MOTOR_CONTROLLER_PORT || '8080');

export interface MotorCommand {
  command: 'move_x' | 'move_y' | 'zoom_in_fine' | 'zoom_out_fine';
  amount?: number;
}

export interface MotorResponse {
  success: boolean;
  message: string;
  command?: MotorCommand;
  error?: string;
}

export class MotorService {
  /**
   * Send a command to the motor controller
   * @param command The motor command object
   * @returns Promise with the response
   */
  static async sendCommand(command: MotorCommand): Promise<MotorResponse> {
    return new Promise((resolve, reject) => {
      // Default amount to 1 if not provided
      const commandToSend: MotorCommand = {
        command: command.command,
        amount: command.amount ?? 1
      };

      // Create a client socket
      const client = new net.Socket();
      
      // Set timeout for connection
      const timeout = setTimeout(() => {
        client.destroy();
        resolve({
          success: false,
          message: 'Connection timeout',
          error: `Failed to connect to ${MOTOR_CONTROLLER_IP}:${MOTOR_CONTROLLER_PORT}`
        });
      }, 5000); // 5 second timeout

      // Connect to the motor controller
      client.connect(MOTOR_CONTROLLER_PORT, MOTOR_CONTROLLER_IP, () => {
        clearTimeout(timeout);
        console.log(`Connected to motor controller at ${MOTOR_CONTROLLER_IP}:${MOTOR_CONTROLLER_PORT}`);
        
        // Send the command as JSON string
        const commandString = JSON.stringify(commandToSend);
        client.write(commandString);
      });

      // Handle response data
      client.on('data', (data) => {
        console.log('Received response:', data.toString());
        client.destroy(); // Close connection after receiving response
        
        try {
          // Try to parse response as JSON
          const response = JSON.parse(data.toString());
          resolve({
            success: true,
            message: 'Command executed successfully',
            command: commandToSend,
            ...response
          });
        } catch (error) {
          // If response is not JSON, return as plain text
          resolve({
            success: true,
            message: data.toString(),
            command: commandToSend
          });
        }
      });

      // Handle errors
      client.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Motor controller connection error:', error);
        resolve({
          success: false,
          message: 'Connection error',
          error: error.message
        });
      });

      // Handle connection close
      client.on('close', () => {
        clearTimeout(timeout);
        console.log('Connection to motor controller closed');
      });
    });
  }

  /**
   * Validate motor command
   * @param command The command to validate
   * @returns Validation result
   */
  static validateCommand(command: any): { valid: boolean; error?: string } {
    const validCommands = ['move_x', 'move_y', 'zoom_in_fine', 'zoom_out_fine'];
    
    if (!command || typeof command !== 'object') {
      return { valid: false, error: 'Invalid command format' };
    }

    if (!command.command || !validCommands.includes(command.command)) {
      return { valid: false, error: `Invalid command. Must be one of: ${validCommands.join(', ')}` };
    }

    if (command.amount !== undefined) {
      if (typeof command.amount !== 'number' || !Number.isInteger(command.amount)) {
        return { valid: false, error: 'Amount must be an integer' };
      }
      if (command.amount < 1) {
        return { valid: false, error: 'Amount must be greater than 0' };
      }
    }

    return { valid: true };
  }
}
