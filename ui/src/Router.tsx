import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import App from './App'
import Collector from './views/Collector'
import Dispatcher from './views/Dispatcher'
import Login from './views/Login'
import Watcher from './views/Watcher'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="collector" element={<Collector />} />
          <Route path="dispatcher" element={<Dispatcher />} />
          <Route path="watcher" element={<Watcher />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<>404</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
