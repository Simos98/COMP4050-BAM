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
      // Call AuthContext.login(email, password) which uses mockAuth.login currently
      await login(values.email, values.password)
      // login succeeded, restore current user from AuthContext
      message.success('Logged in')
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error(err)
      // show better message when mockAuth returns a status
      if (err?.status === 401) message.error('Invalid email or password')
      else message.error(err?.message || 'Invalid credentials or server error.')
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
