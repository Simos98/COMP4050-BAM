import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import 'antd/dist/reset.css'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import { useMocks } from './services/useMocks'

console.log(`🧪 Mock Mode: ${useMocks}`)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
