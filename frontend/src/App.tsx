import { Layout, Menu, Button } from 'antd'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  SettingOutlined,
  LoginOutlined,
} from '@ant-design/icons'
import Home from './pages/Home'
import Bookings from './pages/Bookings'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Devices from './pages/Devices'
import Unauthorized from './pages/Unauthorized'
import { useAuth } from './context/AuthContext'
import RequireAuth from './routes/RequireAuth'
import RequireRole from './routes/RequireRole'

const { Header, Sider, Content } = Layout

export default function App() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const pathToKey: Record<string, string> = {
    '/': 'dashboard',
    '/bookings': 'bookings',
    '/devices': 'devices',
    '/admin': 'admin',
    '/login': 'login',
    '/unauthorized': 'unauth',
  }
  const selectedKey = pathToKey[location.pathname] ?? 'dashboard'

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    ...(user
      ? [
          { key: 'bookings', icon: <CalendarOutlined />, label: <Link to="/bookings">Bookings</Link> },
          { key: 'devices', icon: <ExperimentOutlined />, label: <Link to="/devices">Devices</Link> },
          // show Admin only if role === 'admin'
          ...(user.role === 'admin'
            ? [{ key: 'admin', icon: <SettingOutlined />, label: <Link to="/admin">Admin</Link> }]
            : []),
        ]
      : [{ key: 'login', icon: <LoginOutlined />, label: <Link to="/login">Login</Link> }]),
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', padding: 16, fontWeight: 600 }}>BioScope BAM</div>
        <Menu theme="dark" mode="inline" items={menuItems} selectedKeys={[selectedKey]} />
      </Sider>

      <Layout>
        <Header
          style={{
            background: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px'
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {user ? `Welcome, ${user.name} (${user.role})` : 'Not logged in'}
          </div>
          {user && <Button onClick={logout} danger>Logout</Button>}
        </Header>

        <Content style={{ margin: 24 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected pages */}
            <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
            <Route path="/devices"  element={<RequireAuth><Devices /></RequireAuth>} />
            <Route path="/admin"    element={<RequireRole role="admin"><Admin /></RequireRole>} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
