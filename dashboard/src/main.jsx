import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SafetyProvider } from './context/SafetyContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <SafetyProvider>
    <App />
  </SafetyProvider>
</StrictMode>,
)
