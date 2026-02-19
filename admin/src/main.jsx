import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './index.scss'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from './contexts/ConfigContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </BrowserRouter>
)
