import React from 'react'
import { createRoot } from 'react-dom/client'
import './_reset.css'

import Router from './Router';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)