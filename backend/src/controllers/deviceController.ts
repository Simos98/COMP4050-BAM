import { Request, Response } from 'express';
import { deviceService } from '../services/deviceService';
import { sendSuccess, sendError } from '../utils/apiResponses';

export const getAllDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const devices = await deviceService.findAll();
    sendSuccess(res, { devices });
  } catch (err) {
    console.error('getAllDevices error', err);
    sendError(res, 'Could not fetch devices', 500);
  }
};

export const getDeviceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const device = await deviceService.findById(id);
    if (!device) {
      sendError(res, 'Device not found', 404);
      return;
    }
    sendSuccess(res, { device });
  } catch (err) {
    console.error('getDeviceById error', err);
    sendError(res, 'Could not fetch device', 500);
  }
};

export const createDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user should be set by authenticate middleware; authorizeAdmin middleware should run before this in routes
    const { deviceId, lab, ipAddress, port } = req.body;

    if (!deviceId || !lab || !ipAddress || port === undefined) {
      sendError(res, 'deviceId, lab, ipAddress and port are required', 400);
      return;
    }

    const portNum = Number(port);
    if (Number.isNaN(portNum) || portNum <= 0) {
      sendError(res, 'port must be a positive integer', 400);
      return;
    }

    const created = await deviceService.create({
      deviceId,
      lab,
      ipAddress,
      port: portNum,
    });

    sendSuccess(res, { device: created }, 'Device created');
  } catch (err: any) {
    console.error('createDevice error', err);
    if (err?.code === 'P2002') {
      sendError(res, 'Device with that deviceId already exists', 409);
      return;
    }
    sendError(res, 'Could not create device', 500);
  }
};

export const updateDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deviceId, lab, ipAddress, port } = req.body;

    const data: any = {};
    if (deviceId !== undefined) data.deviceId = deviceId;
    if (lab !== undefined) data.lab = lab;
    if (ipAddress !== undefined) data.ipAddress = ipAddress;
    if (port !== undefined) {
      const portNum = Number(port);
      if (Number.isNaN(portNum) || portNum <= 0) {
        sendError(res, 'port must be a positive integer', 400);
        return;
      }
      data.port = portNum;
    }

    const updated = await deviceService.update(id, data);
    sendSuccess(res, { device: updated }, 'Device updated');
  } catch (err) {
    console.error('updateDevice error', err);
    sendError(res, 'Could not update device', 500);
  }
};

export const deleteDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deviceService.deleteById(id);
    res.status(204).send();
  } catch (err) {
    console.error('deleteDevice error', err);
    sendError(res, 'Could not delete device', 500);
  }
};