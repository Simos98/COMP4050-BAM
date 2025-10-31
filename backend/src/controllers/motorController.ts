import { Request, Response } from 'express';
import { MotorService, MotorCommand } from '../services/motorService';
import { createSuccessResponse, createErrorResponse } from '../utils/apiResponses';

export class MotorController {
  /**
   * Move X motor
   * POST /api/motor/move-x
   */
  static async moveX(req: Request, res: Response) {
    try {
      const command: MotorCommand = {
        command: 'move_x',
        amount: req.body.amount
      };

      // Validate command
      const validation = MotorService.validateCommand(command);
      if (!validation.valid) {
        return res.status(400).json(createErrorResponse(validation.error || 'Invalid command'));
      }

      // Send command to motor controller
      const result = await MotorService.sendCommand(command);

      if (result.success) {
        return res.status(200).json(createSuccessResponse(
          `X motor moved ${command.amount || 1} steps`,
          result
        ));
      } else {
        return res.status(500).json(createErrorResponse(
          result.error || 'Failed to execute command',
          result
        ));
      }
    } catch (error) {
      console.error('Error in moveX:', error);
      return res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  /**
   * Move Y motor
   * POST /api/motor/move-y
   */
  static async moveY(req: Request, res: Response) {
    try {
      const command: MotorCommand = {
        command: 'move_y',
        amount: req.body.amount
      };

      // Validate command
      const validation = MotorService.validateCommand(command);
      if (!validation.valid) {
        return res.status(400).json(createErrorResponse(validation.error || 'Invalid command'));
      }

      // Send command to motor controller
      const result = await MotorService.sendCommand(command);

      if (result.success) {
        return res.status(200).json(createSuccessResponse(
          `Y motor moved ${command.amount || 1} steps`,
          result
        ));
      } else {
        return res.status(500).json(createErrorResponse(
          result.error || 'Failed to execute command',
          result
        ));
      }
    } catch (error) {
      console.error('Error in moveY:', error);
      return res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  /**
   * Zoom in (fine adjustment)
   * POST /api/motor/zoom-in
   */
  static async zoomIn(req: Request, res: Response) {
    try {
      const command: MotorCommand = {
        command: 'zoom_in_fine',
        amount: req.body.amount
      };

      // Validate command
      const validation = MotorService.validateCommand(command);
      if (!validation.valid) {
        return res.status(400).json(createErrorResponse(validation.error || 'Invalid command'));
      }

      // Send command to motor controller
      const result = await MotorService.sendCommand(command);

      if (result.success) {
        return res.status(200).json(createSuccessResponse(
          `Zoomed in ${command.amount || 1} steps`,
          result
        ));
      } else {
        return res.status(500).json(createErrorResponse(
          result.error || 'Failed to execute command',
          result
        ));
      }
    } catch (error) {
      console.error('Error in zoomIn:', error);
      return res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  /**
   * Zoom out (fine adjustment)
   * POST /api/motor/zoom-out
   */
  static async zoomOut(req: Request, res: Response) {
    try {
      const command: MotorCommand = {
        command: 'zoom_out_fine',
        amount: req.body.amount
      };

      // Validate command
      const validation = MotorService.validateCommand(command);
      if (!validation.valid) {
        return res.status(400).json(createErrorResponse(validation.error || 'Invalid command'));
      }

      // Send command to motor controller
      const result = await MotorService.sendCommand(command);

      if (result.success) {
        return res.status(200).json(createSuccessResponse(
          `Zoomed out ${command.amount || 1} steps`,
          result
        ));
      } else {
        return res.status(500).json(createErrorResponse(
          result.error || 'Failed to execute command',
          result
        ));
      }
    } catch (error) {
      console.error('Error in zoomOut:', error);
      return res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  /**
   * Generic command endpoint (alternative implementation)
   * POST /api/motor/command
   * This endpoint accepts any valid command in the request body
   */
  static async sendCommand(req: Request, res: Response) {
    try {
      const command: MotorCommand = req.body;

      // Validate command
      const validation = MotorService.validateCommand(command);
      if (!validation.valid) {
        return res.status(400).json(createErrorResponse(validation.error || 'Invalid command'));
      }

      // Send command to motor controller
      const result = await MotorService.sendCommand(command);

      if (result.success) {
        const actionMessages: Record<string, string> = {
          'move_x': `X motor moved ${command.amount || 1} steps`,
          'move_y': `Y motor moved ${command.amount || 1} steps`,
          'zoom_in_fine': `Zoomed in ${command.amount || 1} steps`,
          'zoom_out_fine': `Zoomed out ${command.amount || 1} steps`
        };

        return res.status(200).json(createSuccessResponse(
          actionMessages[command.command] || 'Command executed',
          result
        ));
      } else {
        return res.status(500).json(createErrorResponse(
          result.error || 'Failed to execute command',
          result
        ));
      }
    } catch (error) {
      console.error('Error in sendCommand:', error);
      return res.status(500).json(createErrorResponse('Internal server error'));
    }
  }
}
