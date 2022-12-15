import React from 'react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

import styles from './Dashboard.module.css'

function Feed() {
  // TODO: Get latest N dispatches from backend
  const tmpFeeds = [
    {
      time: dayjs().format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '123',
    },
    {
      time: dayjs().subtract(1, 'hour').format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '1223',
    },
    {
      time: dayjs().subtract(2, 'hour').format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '1253',
    },
    {
      time: dayjs().subtract(3, 'hour').format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '1523',
    },
    {
      time: dayjs().subtract(4, 'hour').format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '1623',
    },
    {
      time: dayjs().subtract(5, 'hour').format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '1233',
    },
    {
      time: dayjs().subtract(6, 'hour').format('HH:mm:ss'),
      medications: ['hello', 'world'],
      id: '12433',
    },
  ]

  return (
    <section className={styles.feed}>
      <header>Dispatch Feed</header>
      <div className={styles.feedList}>
        {tmpFeeds.map(({ id, time, medications }) => (
          <div className={styles.feedItem} key={id}>
            <span className={styles.time}>{time}</span>
            <span className={styles.meds}>{medications.join(', ')}</span>
            <span className={styles.dispatchId}>ID: {id}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <section className={styles.controls}>
        <Link to="/dispatcher/new">
          <button className={styles.control}>dispatch</button>
        </Link>
        <button className={styles.control}>inspect</button>
        {/** We don't have a plan to implement this for now. */}
        <button className={styles.control}>history</button>
      </section>
      <Feed />
    </div>
  )
}
