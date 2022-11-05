import * as React from 'react'
import { Outlet } from 'react-router-dom'

import ReloadPrompt from './sw/ReloadPrompt'
import Sync from './sw/Sync'

import styles from './App.module.css'

export default function App() {
  // replaced dynamicaly
  const date = '__DATE__'

  return (
    <main className={styles.app}>
      <div className={styles.built}>Built at: {date}</div>
      <Outlet />
      <ReloadPrompt />
      <Sync />
    </main>
  )
}