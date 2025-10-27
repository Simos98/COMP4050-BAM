import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import BookingsPage from './pages/Bookings';
import CameraControl from './pages/CameraControl';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="header card">
        <div>
          <h2>Bioscope Dashboard</h2>
          <div className="small">Connected backend at {import.meta.env.VITE_API_URL ?? 'unset'}</div>
        </div>
        <nav className="nav">
          {user ? (
            <>
              <Link to="/bookings" className="small">Bookings</Link>
              <Link to="/camera" className="small">Camera</Link>
              <div className="small">Hi, {user.username}</div>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/bookings" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bookings" element={user ? <BookingsPage /> : <Navigate to="/login" />} />
          <Route path="/camera" element={user ? <CameraControl /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}