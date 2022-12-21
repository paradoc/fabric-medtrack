import React, { useEffect, useState } from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import dayjs from 'dayjs'
import { useSessionStorage } from 'usehooks-ts'

import Logo from '../../components/Logo'

import styles from './Dispatcher.module.css'

function CurrentTime() {
  const [time, setTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(dayjs().format('MMM D, YYYY HH:mm:ss ddd'))
    }, 1000)
    return () => {
      clearInterval(id)
    }
  }, [])

  return <div className={styles.time}>{time}</div>
}

export default function Dispatcher() {
  const [isLoggedIn, setIsLoggedIn] = useSessionStorage('login', false)

  return !isLoggedIn ? (
    <Navigate to="/login" />
  ) : (
    <div className={styles.container}>
      <aside>
        <section className={styles.meta}>
          <div className={styles.user}>
            <strong>Mark C.</strong>
            <span>RPh</span>
          </div>
          <CurrentTime />
        </section>
        <section className={styles.buttons}>
          <button onClick={() => setIsLoggedIn(false)} data-testid="logout">
            Logout
          </button>
        </section>
      </aside>
      <main className={styles.main}>
        <Link
          to="/dispatcher"
          style={{ textDecoration: 'none', color: '#333' }}
        >
          <Logo />
        </Link>
        <Outlet />
      </main>
    </div>
  )
}
