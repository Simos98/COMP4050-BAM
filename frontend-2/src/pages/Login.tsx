import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (e: any) {
      setErr(e?.body?.message ?? e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '24px auto' }}>
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
        {err && <div className="small" style={{ marginTop: 8, color: '#ffb4a2' }}>{err}</div>}
      </form>
    </div>
  );
}