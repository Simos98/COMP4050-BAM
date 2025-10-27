import React, { useEffect, useRef, useState } from 'react';
import { fetchLatestImage, sendCameraCommand } from '../services/camera';

const commandOptions = [
  { label: 'Move X', value: 'move_x', needsAmount: true },
  { label: 'Move Y', value: 'move_y', needsAmount: true },
  { label: 'Zoom In Fine', value: 'zoom_in_fine', needsAmount: true },
  { label: 'Zoom Out Fine', value: 'zoom_out_fine', needsAmount: true },
  { label: 'Zoom In Coarse', value: 'zoom_in_coarse', needsAmount: true },
  { label: 'Zoom Out Coarse', value: 'zoom_out_coarse', needsAmount: true },
  { label: 'Brightness Up', value: 'brightness_up', needsAmount: true },
  { label: 'Brightness Down', value: 'brightness_down', needsAmount: true },
  { label: 'Aperture Up', value: 'aperture_up', needsAmount: true },
  { label: 'Aperture Down', value: 'aperture_down', needsAmount: true },
  { label: 'Change Lens', value: 'change_lens', needsAmount: false },
];

export default function CameraControl() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cmd, setCmd] = useState(commandOptions[0].value);
  const [amount, setAmount] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const blob = await fetchLatestImage();
        if (!mounted) return;
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImgUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        }
      } catch (e) {
        setError('Failed to fetch image');
      }
    }
    load();
    // poll every 1s
    intervalRef.current = window.setInterval(load, 1000);

    return () => {
      mounted = false;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, []);

  const send = async () => {
    setBusy(true); setError(null);
    try {
      const payload: any = { command: cmd };
      if (amount && cmd !== 'change_lens') payload.amount = Math.max(1, Math.floor(amount));
      const res = await sendCameraCommand(payload);
      // backend responds with { status: "ok" } or other status; display simple feedback
      if (res?.status === 'ok') {
        // ok
      } else if (res?.status === 'invalid command') {
        setError('Invalid command');
      } else {
        // show returned status if present
        if (res?.status) setError(String(res.status));
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send command');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <h3>Camera / Microscope Controls</h3>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ flex: 1 }}>
          <div className="small">Live image (polled every second)</div>
          <div style={{ marginTop:8 }}>
            {imgUrl ? <img src={imgUrl} alt="live" className="img-preview" /> : <div className="small">No image</div>}
          </div>
        </div>

        <div style={{ width: 320 }}>
          <div className="small">Command</div>
          <select value={cmd} onChange={e => setCmd(e.target.value)}>
            {commandOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div style={{ marginTop:8 }}>
            <div className="small">Amount (if applicable)</div>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={1} />
          </div>

          <div className="controls" style={{ marginTop:12 }}>
            <button onClick={send} disabled={busy}>{busy ? 'Sending...' : 'Send Command'}</button>
          </div>

          {error && <div className="small" style={{ color: '#ffb4a2', marginTop:8 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}