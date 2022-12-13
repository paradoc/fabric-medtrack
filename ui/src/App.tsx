import * as React from 'react'
import { Outlet } from 'react-router-dom'

import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(isSameOrAfter)
dayjs.extend(duration)
dayjs.extend(relativeTime)

import ReloadPrompt from './sw/ReloadPrompt'
import Sync from './sw/Sync'

import styles from './App.module.css'

export default function App() {
  // replaced dynamicaly
  const date = '__DATE__'

  return (
    <main className={styles.app}>
      <Outlet />
      <div className={styles.meta}>
        <ReloadPrompt />
        <Sync />
        <footer className={styles.built}>Built: {date}</footer>
      </div>
    </main>
  )
}
