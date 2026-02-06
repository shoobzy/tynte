import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from './router'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find root element. Ensure there is an element with id="root" in the HTML.')
}

createRoot(rootElement).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
