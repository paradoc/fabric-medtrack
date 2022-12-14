import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './_reset.css'

import Router from './Router'
import { store } from './store'

declare global {
  interface Window {
    built: string
  }
}

// Replaced dynamically by vite.
window.built = '__DATE__'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
  </React.StrictMode>
)
