import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import App from './App'
import Collector from './views/Collector'
import Dashboard from './outlets/Dashboard'
import Dispatcher from './views/Dispatcher'
import Dispatch from './outlets/Dispatch'
import Inspect from './outlets/Inspect'
import Login from './views/Login'
import Watcher from './views/Watcher'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Login />} />
          <Route path="collector" element={<Collector />} />
          <Route path="dispatcher" element={<Dispatcher />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<Dispatch />} />
            <Route path="inspect/:id" element={<Inspect />} />
            <Route path="*" element={<>404</>} />
          </Route>
          <Route path="watcher" element={<Watcher />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<>404</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
