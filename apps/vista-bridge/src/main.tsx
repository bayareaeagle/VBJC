import './mesh-polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MeshProvider } from '@meshsdk/react'

createRoot(document.getElementById('root')!).render(
  <MeshProvider>

  <StrictMode>
    <App />
  </StrictMode>
  </MeshProvider>
)
