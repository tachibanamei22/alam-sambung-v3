import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './lib/i18n'
import { startApp } from './lib/sync'
import { ThemeProvider } from './lib/theme'
import './styles/index.css'

startApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
