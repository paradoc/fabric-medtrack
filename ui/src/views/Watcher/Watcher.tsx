import React from 'react'
import { Outlet } from 'react-router'
import { Link } from 'react-router-dom'

import styles from './Watcher.module.css'

export default function Watcher() {
  return (
    <div className={styles.container}>
      <Link to="/watcher" className={styles.link}>
        <header>RxWatch</header>
      </Link>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  )
}
