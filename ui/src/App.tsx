import * as React from 'react'
import { Outlet } from 'react-router-dom'

import ReloadPrompt from './sw/ReloadPrompt'
import Sync from './sw/Sync'

import reactLogo from './assets/react.svg'
import styles from './App.module.css'

export default function App() {
  // replaced dynamicaly
  const date = '__DATE__'

  return (
    <main className={styles.app}>
      <img src="/favicon.svg" alt="PWA Logo" width="60" height="60" />
      <img src={reactLogo} className="logo react" alt="React logo" />
      <h1 className={styles.title}>PWA React!</h1>
      <div className={styles.built}>Built at: {date}</div>
      <Outlet />
      <ReloadPrompt />
      <Sync />
    </main>
  )
}