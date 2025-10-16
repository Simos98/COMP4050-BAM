import { Card, Form, Input, Button, message } from 'antd'
import { login as loginRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  if (user) return <Navigate to={from} replace />

  const onFinish = async (values: any) => {
    try {
      // MOCK: assign role by email for testing
      const role = String(values.email).toLowerCase().includes('admin') ? 'admin' : 'user'
      const mockUser = { name: 'Test User', email: values.email, role } as const

      // Real flow later:
      // const res = await loginRequest(values.email, values.password)
      // login(res.data.user)

      login(mockUser as any)
      message.success(`Logged in as ${role}`)
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error(err)
      message.error('Invalid credentials or server error.')
    }
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <Card title="Login to BioScope" style={{ width: 380 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}><Input.Password /></Form.Item>
          <Button type="primary" htmlType="submit" block>Sign In</Button>
        </Form>
      </Card>
    </div>
  )
}
