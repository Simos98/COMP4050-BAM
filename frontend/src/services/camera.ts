export type CameraState = { x: number; y: number; zoom: number }

const STORE_KEY = 'mock_camera_state_v1'
function readStore(): Record<string, CameraState> {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function writeStore(s: Record<string, CameraState>) {
  sessionStorage.setItem(STORE_KEY, JSON.stringify(s))
}
function delay(ms = 180) { return new Promise(res => setTimeout(res, ms)) }

function ensureState(deviceId: string) {
  const store = readStore()
  if (!store[deviceId]) store[deviceId] = { x: 0, y: 0, zoom: 1 }
  return { store, state: store[deviceId] }
}

function drawPreview(deviceId: string, state: CameraState, width = 1000, height = 700): string {
  // create a canvas element and draw a simple mock preview
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  // background
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, width, height)
  // grid
  ctx.strokeStyle = '#222'
  for (let i = 0; i < width; i += 50) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, height)
    ctx.stroke()
  }
  for (let j = 0; j < height; j += 50) {
    ctx.beginPath()
    ctx.moveTo(0, j)
    ctx.lineTo(width, j)
    ctx.stroke()
  }
  // central indicator representing camera view position
  const cx = width/2 + state.x * 20
  const cy = height/2 + state.y * 20
  const r = 12 * state.zoom
  ctx.fillStyle = '#ffcc33'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#000'
  ctx.stroke()

  // header text
  ctx.fillStyle = '#fff'
  ctx.font = '20px sans-serif'
  ctx.fillText(`Device: ${deviceId}`, 16, 28)
  ctx.fillText(`Pos: x=${state.x}, y=${state.y}, zoom=${state.zoom.toFixed(2)}`, 16, 54)
  ctx.fillText(`Updated: ${new Date().toLocaleString()}`, 16, 80)

  // return data url
  return canvas.toDataURL('image/jpeg', 0.8)
}

export async function getPreview(deviceId: string) {
  await delay()
  const { store, state } = ensureState(deviceId)
  writeStore(store)
  return { url: drawPreview(deviceId, state), state }
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'zoomin' | 'zoomout' | 'reset'

export async function move(deviceId: string, dir: Direction) {
  await delay(220)
  const { store, state } = ensureState(deviceId)
  switch (dir) {
    case 'up': state.y -= 1; break
    case 'down': state.y += 1; break
    case 'left': state.x -= 1; break
    case 'right': state.x += 1; break
    case 'zoomin': state.zoom = Math.min(4, state.zoom + 0.2); break
    case 'zoomout': state.zoom = Math.max(0.3, state.zoom - 0.2); break
    case 'reset': state.x = 0; state.y = 0; state.zoom = 1; break
  }
  store[deviceId] = state
  writeStore(store)
  return { url: drawPreview(deviceId, state), state }
}