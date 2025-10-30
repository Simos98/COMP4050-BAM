import { apiGet, apiPost, apiDelete } from './api'

export type DeviceRecord = {
  id: string
  deviceId: string
  lab: string
  ip: string
  port: number
  meta?: any
}

export async function listDevices(): Promise<DeviceRecord[]> {
  const body = await apiGet('/api/devices')
  // expect { items: [...] } or array
  return body.items ?? body
}

export async function getDevice(idOrDeviceId: string): Promise<DeviceRecord | null> {
  try {
    const body = await apiGet(`/api/devices/${encodeURIComponent(idOrDeviceId)}`)
    return body.device ?? body
  } catch (err: any) {
    if (err?.status === 404) return null
    throw err
  }
  mockDevices.push(newDevice)
  return newDevice
}

export async function createDevice(payload: { deviceId: string; lab: string; ip: string; port: number }) {
  const body = await apiPost('/api/devices', payload)
  return body.device ?? body
}

export async function deleteDevice(id: string) {
  return apiDelete(`/api/devices/${encodeURIComponent(id)}`)
}

/**
 * Helper: return a base URL for the device if ip/port available (used by camera)
 */
export function getDeviceBaseUrl(device: DeviceRecord) {
  if (!device || !device.ip || !device.port) return null
  return `http://${device.ip}:${device.port}`
}
