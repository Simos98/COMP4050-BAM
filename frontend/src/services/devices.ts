import { apiFetch } from './api'

export type DeviceRecord = {
  id: string
  deviceId: string
  lab: string
  ipAddress: string
  port: number
  meta?: any
}

export type DeviceCreatePayload = {
  deviceId: string
  lab: string
  ipAddress: string
  port: number
}

function extractDevicesResponse(res: any): DeviceRecord[] {
  const body = res?.data ?? res
  return (
    body?.data?.devices ??
    body?.devices ??
    (Array.isArray(body) ? body : undefined) ??
    []
  )
}

export async function listDevices(): Promise<DeviceRecord[]> {
  const body = await apiFetch('/api/devices', { method: 'GET' })
  return extractDevicesResponse(body)
}

export async function getDevice(id: string): Promise<DeviceRecord | null> {
  try {
    const body = await apiFetch(`/api/devices/${id}`, { method: 'GET' })
    return body?.data?.device ?? body?.device ?? body ?? null
  } catch {
    return null
  }
  mockDevices.push(newDevice)
  return newDevice
}

export async function createDevice(payload: DeviceCreatePayload) {
  const body = await apiFetch('/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return body?.data?.device ?? body?.device ?? body
}

export async function updateDevice(id: string, payload: Partial<DeviceCreatePayload>) {
  const body = await apiFetch(`/api/devices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return body?.data?.device ?? body?.device ?? body
}

export async function deleteDevice(id: string) {
  await apiFetch(`/api/devices/${id}`, { method: 'DELETE' })
}

/**
 * Helper: return a base URL for the device if ip/port available (used by camera)
 */
export function getDeviceBaseUrl(device: DeviceRecord) {
  if (!device || !device.ipAddress || !device.port) return null
  return `http://${device.ipAddress}:${device.port}`
}
