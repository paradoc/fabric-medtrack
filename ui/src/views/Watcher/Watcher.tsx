import React from 'react'
import { Outlet } from 'react-router'

import styles from './Watcher.module.css'

export default function Watcher() {
  return (
    <div className={styles.container}>
      <header>RxWatch</header>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  )
}
