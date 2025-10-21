import { getUserFromToken } from './mockAuth'

export type Device = {
  id: string // internal uuid
  deviceId: string // visible device id, e.g. "B-001"
  lab: string
}

const KEY = 'bioscope:devices'

function seedIfEmpty() {
  const raw = localStorage.getItem(KEY)
  if (raw) return

  const demo: Device[] = [
    { id: crypto.randomUUID(), deviceId: 'B-001', lab: 'Lab 1' },
    { id: crypto.randomUUID(), deviceId: 'B-002', lab: 'Lab 2' },
    { id: crypto.randomUUID(), deviceId: 'B-003', lab: 'Lab 3' },
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

export async function createDevice(payload: { deviceId: string; lab: string }): Promise<Device> {
  await delay()
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }
  if (user.role !== 'admin') { const e: any = new Error('Forbidden'); e.status = 403; throw e }

  const devices = readStore()
  if (devices.find(d => d.deviceId === payload.deviceId)) {
    const e: any = new Error('Device exists'); e.status = 409; throw e
  }
  const device: Device = {
    id: crypto.randomUUID(),
    deviceId: payload.deviceId,
    lab: payload.lab,
  }
  devices.push(device)
  writeStore(devices)
  return device
}