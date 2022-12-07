import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './_reset.css'

import Router from './Router'
import { store } from './store'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
  </React.StrictMode>
)
