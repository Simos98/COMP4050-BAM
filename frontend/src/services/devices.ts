import { getUserFromToken } from './mockAuth'

export type Device = {
  id: string
  deviceId: string
  lab: string
  ip?: string   // IP address of the microscope/camera (mock)
  port?: number // port of the microscope/camera (mock)
}

const KEY = 'bioscope:devices'

function seedIfEmpty() {
  const raw = localStorage.getItem(KEY)
  if (raw) return

  const demo: Device[] = [
    { id: crypto.randomUUID(), deviceId: 'B-001', lab: 'Lab 1', ip: '192.168.10.101', port: 8000 },
    { id: crypto.randomUUID(), deviceId: 'B-002', lab: 'Lab 2', ip: '192.168.10.102', port: 8000 },
    { id: crypto.randomUUID(), deviceId: 'B-003', lab: 'Lab 3', ip: '192.168.10.103', port: 8000 },
  ]
  localStorage.setItem(KEY, JSON.stringify(demo))
}
seedIfEmpty()

function readStore(): Device[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as Device[]
  } catch {
    return []
  }
}

function writeStore(devices: Device[]) {
  localStorage.setItem(KEY, JSON.stringify(devices))
}

function delay(ms = 120) {
  return new Promise(res => setTimeout(res, ms))
}

export async function listDevices(): Promise<Device[]> {
  await delay()
  return readStore()
}

export async function getDevice(id: string): Promise<Device | null> {
  await delay()
  const dev = readStore().find(d => d.id === id || d.deviceId === id) ?? null
  return dev
}

/**
 * Create a device. ip/port are optional but recommended for linking to microscope/camera.
 */
export async function createDevice(payload: { deviceId: string; lab: string; ip?: string; port?: number }): Promise<Device> {
  await delay()
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }
  if (user.role !== 'admin') { const e: any = new Error('Forbidden'); e.status = 403; throw e }

  const devices = readStore()

  if (devices.find(d => d.deviceId === payload.deviceId)) {
    const e: any = new Error('Device ID already exists')
    e.status = 409
    throw e
  }

  // Prevent duplicate ip+port mapping
  if (payload.ip && payload.port && devices.find(d => d.ip === payload.ip && d.port === payload.port)) {
    const e: any = new Error('Device with same IP and port already exists')
    e.status = 409
    throw e
  }

  const device: Device = {
    id: crypto.randomUUID(),
    deviceId: payload.deviceId,
    lab: payload.lab,
    ip: payload.ip,
    port: payload.port
  }
  devices.push(device)
  writeStore(devices)
  return device
}

/**
 * Delete a device (admin only)
 */
export async function deleteDevice(id: string): Promise<void> {
  await delay()
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }
  if (user.role !== 'admin') { const e: any = new Error('Forbidden'); e.status = 403; throw e }

  const devices = readStore()
  const idx = devices.findIndex(d => d.id === id || d.deviceId === id)
  if (idx === -1) {
    const e: any = new Error('Not found')
    e.status = 404
    throw e
  }
  devices.splice(idx, 1)
  writeStore(devices)
}

/**
 * Helper: return a base URL for the device if ip/port available (mock usage).
 */
export function getDeviceBaseUrl(deviceOrId: Device | string): string | null {
  const devices = readStore()
  const dev: Device | undefined = typeof deviceOrId === 'string'
    ? devices.find(d => d.id === deviceOrId || d.deviceId === deviceOrId)
    : deviceOrId

  if (!dev || !dev.ip || !dev.port) return null
  return `http://${dev.ip}:${dev.port}`
}