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
    return JSON.parse(raw)
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
  await delay(180)
  const devices = readStore()
  if (devices.find(d => d.deviceId === payload.deviceId)) {
    throw new Error('Device ID already exists')
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