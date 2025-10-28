import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: '2rem',
          fontWeight: 600,
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        BioScope Access Management
      </h1>

      <div
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px',
          color: 'white',
        }}
      >
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Welcome Back!</h3>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Username (email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading || authLoading} style={buttonStyle}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            disabled={loading || authLoading}
            style={{ ...buttonStyle, background: 'rgba(255,255,255,0.15)' }}
          >
            Create Account
          </button>
          {err && (
            <div style={{ color: '#ffb4a2', marginTop: '1rem', textAlign: 'center' }}>
              {err}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  marginBottom: '12px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  marginTop: '8px',
  borderRadius: '8px',
  border: 'none',
  background: 'rgba(0,123,255,0.8)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 600,
};