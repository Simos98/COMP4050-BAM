import axios from 'axios';
import { config } from 'dotenv';

config();

// Get IP and port from environment variables with defaults
const MOTOR_CONTROLLER_IP = process.env.MOTOR_CONTROLLER_IP || '192.168.1.100';
const MOTOR_CONTROLLER_PORT = parseInt(process.env.MOTOR_CONTROLLER_PORT || '8080');
const MOTOR_CONTROLLER_URL = `http://${MOTOR_CONTROLLER_IP}:${MOTOR_CONTROLLER_PORT}/send_command/`;

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
    try {
      // Default amount to 1 if not provided
      const commandToSend: MotorCommand = {
        command: command.command,
        amount: command.amount ?? 1
      };

      console.log(`Sending command to motor controller at ${MOTOR_CONTROLLER_URL}`);
      console.log('Command:', commandToSend);

      // Send HTTP POST request to motor controller
      const response = await axios.post(MOTOR_CONTROLLER_URL, commandToSend, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });

      console.log('Received response:', response.data);

      // Return success response
      return {
        success: true,
        message: 'Command executed successfully',
        command: commandToSend,
        ...response.data
      };

    } catch (error: any) {
      console.error('Motor controller error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: 'Connection refused',
          error: `Cannot connect to motor controller at ${MOTOR_CONTROLLER_URL}`
        };
      } else if (error.code === 'ETIMEDOUT') {
        return {
          success: false,
          message: 'Connection timeout',
          error: `Motor controller did not respond within 5 seconds`
        };
      } else if (error.response) {
        // The motor controller responded with an error status
        return {
          success: false,
          message: `Motor controller error: ${error.response.status}`,
          error: error.response.data || 'Unknown error'
        };
      } else {
        return {
          success: false,
          message: 'Request failed',
          error: error.message
        };
      }
    }
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
