import { apiFetch } from './api';

export type CameraCommand = {
  command: string;
  amount?: number;
};

export async function sendCameraCommand(cmd: CameraCommand) {
  // exact JSON format required by your ESP32 forwarding layer
  return apiFetch('/camera/command', {
    method: 'POST',
    body: JSON.stringify(cmd),
  });
}

export async function fetchLatestImage(): Promise<Blob | null> {
  // backend should serve latest image at this endpoint
  const base = import.meta.env.VITE_API_URL ?? '';
  const url = `${base}/camera/latest`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) return null;
  return res.blob();
}