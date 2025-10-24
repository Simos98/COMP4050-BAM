// src/services/devices.ts
import { api } from './api'
import { useMocks } from './useMocks'

export type Device = {
  id: string
  model: string
  location: string
  status: 'online' | 'offline' | 'busy' | 'maintenance'
}

// -------------------------------
// Mock Data
// -------------------------------
const mockDevices: Device[] = [
  { id: 'B-001', model: 'Bioscope Mk2', location: 'Lab 1', status: 'online' },
  { id: 'B-002', model: 'Bioscope Mk1', location: 'Lab 2', status: 'offline' },
  { id: 'B-003', model: 'Bioscope Mk3', location: 'Lab 3', status: 'busy' },
]

// -------------------------------
// Mock Implementations
// -------------------------------
async function mockListDevices(): Promise<Device[]> {
  console.log('🧪 Using mock device data')
  // Always return the array — even if localStorage is empty
  return [...mockDevices]
}

async function mockCreateDevice(device: Omit<Device, 'id'>): Promise<Device> {
  const newDevice: Device = {
    id: Math.random().toString(36).substring(2, 10),
    ...device,
  }
  mockDevices.push(newDevice)
  return newDevice
}

async function mockUpdateDevice(id: string, update: Partial<Device>): Promise<Device | undefined> {
  const index = mockDevices.findIndex((d) => d.id === id)
  if (index === -1) return undefined
  mockDevices[index] = { ...mockDevices[index], ...update }
  return mockDevices[index]
}

async function mockDeleteDevice(id: string): Promise<void> {
  const idx = mockDevices.findIndex((d) => d.id === id)
  if (idx !== -1) mockDevices.splice(idx, 1)
}

// -------------------------------
// API Implementations (backend mode)
// -------------------------------
async function apiListDevices(): Promise<Device[]> {
  const res = await api.get('/devices')
  return res.data.data ?? res.data
}

async function apiCreateDevice(device: Omit<Device, 'id'>): Promise<Device> {
  const res = await api.post('/devices', device)
  return res.data.data ?? res.data
}

async function apiUpdateDevice(id: string, update: Partial<Device>): Promise<Device> {
  const res = await api.patch(`/devices/${id}`, update)
  return res.data.data ?? res.data
}

async function apiDeleteDevice(id: string): Promise<void> {
  await api.delete(`/devices/${id}`)
}

// -------------------------------
// Export correct implementations
// -------------------------------
export const listDevices = useMocks ? mockListDevices : apiListDevices
export const createDevice = useMocks ? mockCreateDevice : apiCreateDevice
export const updateDevice = useMocks ? mockUpdateDevice : apiUpdateDevice
export const deleteDevice = useMocks ? mockDeleteDevice : apiDeleteDevice
