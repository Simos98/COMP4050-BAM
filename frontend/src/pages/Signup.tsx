import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // First register the user
      await signup(email, password);
      // Then log them in automatically
      const ok = await login(email, password);
      if (ok) {
        navigate('/bookings');
      } else {
        setErr('Registration successful but login failed');
      }
    } catch (e: any) {
      setErr(e?.body?.message ?? e?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Create Account</h3>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <input
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={loading}
            style={{ ...buttonStyle, background: 'rgba(255,255,255,0.15)' }}
          >
            Back to Login
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