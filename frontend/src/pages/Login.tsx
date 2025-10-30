import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        navigate('/bookings');
      } else {
        setErr('Invalid email/password or session not established');
      }
    } catch (e: any) {
      setErr(e?.body?.message ?? e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh', color: '#fff' }}>
        Checking session…
      </div>
    );

  return (
    <AuthLayout title="BioScope Access Management">
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Login</h3>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Username (email)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || authLoading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          disabled={loading || authLoading}
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          Create Account
        </button>
        {err && (
          <div style={{ color: '#ffb4a2', marginTop: '1rem', textAlign: 'center' }}>
            {err}
          </div>
        )}
      </form>
    </AuthLayout>
  );
}