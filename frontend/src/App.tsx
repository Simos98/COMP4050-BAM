import { Layout, Menu, Button } from 'antd'
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  SettingOutlined,
  LoginOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import Home from './pages/Home'
import Bookings from './pages/Bookings'
import Admin from './pages/Admin'
import BookingDetails from './pages/BookingDetails'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Devices from './pages/Devices'
import Unauthorized from './pages/Unauthorized'
import { useAuth } from './context/AuthContext'
import RequireAuth from './routes/RequireAuth'
import RequireRole from './routes/RequireRole'
import { useEffect, useState } from 'react'

const { Header, Sider, Content } = Layout

export default function App() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('sidebarCollapsed');
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  // persist
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  // Highlight menu for nested routes too (e.g., /bookings/:id)
  const pathname = location.pathname
  const selectedKey =
    pathname.startsWith('/bookings') ? 'bookings' :
    pathname.startsWith('/devices') ? 'devices' :
    pathname.startsWith('/admin') ? 'admin' :
    pathname.startsWith('/login') ? 'login' :
    pathname.startsWith('/unauthorized') ? 'unauth' :
    'dashboard'

  const menuItems = user
    ? [
        { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/home">Dashboard</Link> },
        { key: 'bookings', icon: <CalendarOutlined />, label: <Link to="/bookings">Bookings</Link> },
        { key: 'devices', icon: <ExperimentOutlined />, label: <Link to="/devices">Devices</Link> },
        ...(user.role === 'admin'
          ? [{ key: 'admin', icon: <SettingOutlined />, label: <Link to="/admin">Admin</Link> }]
          : []),
      ]
    : [
        { key: 'login', icon: <LoginOutlined />, label: <Link to="/login">Login</Link> },
      ]

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isAuthPage && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(val) => setCollapsed(val)}
          width={200}
          collapsedWidth={48}
          style={{ position: 'relative' }}
        >
          <div style={{ color: 'white', padding: 16, fontWeight: 600 }}>
            {!collapsed ? 'BioScope BAM' : 'BS'}
          </div>

          <Menu theme="dark" mode="inline" items={menuItems} selectedKeys={[selectedKey]} />

          {/* collapse/expand is handled by the Sider and the bottom button; removed sticky tab */}
        </Sider>
      )}

      <Layout>
        {/* header */}
        {!isAuthPage && (
          <Header
            style={{
              background: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 24px'
            }}
          >
            {/* left */}
            <div style={{ fontWeight: 600 }}>
              {user ? `Welcome, ${user.name} (${user.role})` : 'Not logged in'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user && (
                <Button onClick={logout} danger style={{ flex: '0 0 auto' }}>
                  Logout
                </Button>
              )}
            </div>
          </Header>
        )}
        <Content style={{ margin: isAuthPage ? 0 : (collapsed ? '24px 24px 24px 68px' : 24) }}>
          <Routes>
            {/* default root -> home if logged in, otherwise login */}
            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected pages */}
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
            <Route path="/bookings/:id" element={<RequireAuth><BookingDetails /></RequireAuth>} />
            <Route path="/devices" element={<RequireAuth><Devices /></RequireAuth>} />
            <Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />

            {/* unknown -> home when logged in else login */}
            <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
