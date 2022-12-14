import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Navigate } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'

import styles from './Dispatcher.module.css'

const CurrentTime = () => {
  const [time, setTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
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
          <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        </section>
      </aside>
    </div>
  )
}
