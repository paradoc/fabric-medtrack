import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { prop } from 'rambda'

import { DispatchData } from '../../views/Collector'

import styles from './Dashboard.module.css'

function Feed() {
  // TODO: Get latest N dispatches from backend
  const [feed, setFeed] = useState<DispatchData[]>([])

  const fetchData = useCallback(async () => {
    const response = await fetch('/api/recent/7')
    const data = await response.json()
    setFeed(data)
  }, [])

  useEffect(() => {
    const id = setInterval(fetchData, 2000)
    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <section className={styles.feed}>
      <header>Dispatch Feed</header>
      <div className={styles.feedList}>
        {feed.map(({ dispatch_id, dispatch_date, medications }) => (
          <div className={styles.feedItem} key={dispatch_id}>
            <span className={styles.time}>{dispatch_date}</span>
            <span className={styles.meds}>
              {medications.map(prop('generic_name')).join(', ')}
            </span>
            <Link to={`./inspect/${dispatch_id}`} relative="path">
              <span className={styles.dispatchId}>{dispatch_id}</span>
            </Link>
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

        {/** We don't have a plan to implement this for now. */}
        <button className={styles.control}>
          inspect
          <br />
          (non-functional)
        </button>
        <button className={styles.control}>
          history
          <br />
          (non-functional)
        </button>
      </section>
      <Feed />
    </div>
  )
}
