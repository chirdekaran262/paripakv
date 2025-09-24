import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async';  // 👈 import HelmetProvider
const rootElement = document.getElementById('root')
rootElement.style.width = '100%'
rootElement.style.maxWidth = 'none'
rootElement.style.padding = '0'

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>   {/* 👈 wrap your app */}
      <App />
    </HelmetProvider>
  </StrictMode>,
)
