import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LayoutPreview from './LayoutPreview.jsx'

import { AuthProvider } from './components/AuthProvider.jsx'

const isLayoutPreview = import.meta.env.VITE_UI_PREVIEW === 'true'
  && new URLSearchParams(window.location.search).get('layout-preview') === '1'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isLayoutPreview ? (
      <LayoutPreview />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
)
