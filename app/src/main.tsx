import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppToaster } from './components/AppToaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import './lib/i18n'
import { startApp } from './lib/sync'
import { ThemeProvider } from './lib/theme'
import './styles/index.css'

startApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <AppToaster />
    </ThemeProvider>
  </StrictMode>,
)
