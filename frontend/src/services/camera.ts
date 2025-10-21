import { apiGet, apiPost } from './api'

export type CameraState = { x: number; y: number; zoom: number }

// GET preview image for device
export async function getPreview(deviceId: string) {
  // backend should return { url, state } or a binary stream; we assume JSON with url string
  const body = await apiGet(`/api/devices/${encodeURIComponent(deviceId)}/preview`)
  return body
}

// POST move command to device; backend returns updated preview url/state
export type Direction = 'up' | 'down' | 'left' | 'right' | 'zoomin' | 'zoomout' | 'reset'
export async function move(deviceId: string, dir: Direction) {
  const body = await apiPost(`/api/devices/${encodeURIComponent(deviceId)}/move`, { direction: dir })
  return body
}

// Optionally: start capture job
export async function capture(deviceId: string, options: Record<string, any>) {
  const body = await apiPost(`/api/devices/${encodeURIComponent(deviceId)}/capture`, options)
  return body
}