import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ConnectionStatusBanner } from './components/ConnectionStatusBanner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
        <ConnectionStatusBanner />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
