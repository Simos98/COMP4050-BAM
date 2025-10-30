import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import AuthLayout from '../components/AuthLayout';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

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
      await signup({ studentId, email, password, firstName, lastName });
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
    <AuthLayout title="BioScope Access Management">
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>New here? Create an account!</h3>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <input
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/login')}
          disabled={loading}
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          Back to Login
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