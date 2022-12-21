import React, { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router'
import { prop } from 'rambda'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import styles from './Visualize.module.css'
import { Link } from 'react-router-dom'

type QueryResult = {
  current: number
  expected: number
  generic_name: string
  total_dispatches: number
}

export default function Visualize() {
  const [data, setData] = useState<QueryResult[]>([])
  const [visData, setVisData] = useState<QueryResult[]>([])
  const [hasQueried, setHasQueried] = useState(false)
  const { search } = useLocation()
  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  const medications = searchParams
    .get('g')
    ?.split(',')
    .map((m) => m.trim())
  const start = searchParams.get('s')
  const end = searchParams.get('e')

  useEffect(() => {
    if (medications && medications.length > 0 && start && end && !hasQueried) {
      Promise.all([
        ...medications.map((med) =>
          fetch(`/api/query?generic=${med}&start=${start}&end=${end}`).then(
            (r) => r.json()
          )
        ),
      ]).then((r) => {
        setData(r)
        setHasQueried(true)
      })
    }
  }, [medications, start, end, hasQueried])

  useEffect(() => {
    if (hasQueried && data.length > 0) {
      const sanitized = data.filter((d) => d.total_dispatches !== 0)
      setVisData(sanitized)
    }
  }, [data, hasQueried])

  return (
    <div className={styles.container}>
      <header>
        Compliance rates for medicines:{' '}
        {visData.map(prop('generic_name')).join(', ')} from {start} to {end}
      </header>
      {visData.length > 0 && (
        <div
          style={{ height: '100%', width: '100%', flex: 1 }}
          data-testid="chart"
        >
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              width={640}
              height={480}
              data={visData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generic_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#2B3A55" />
              <Bar dataKey="expected" fill="#9F8772" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <Link to="/watcher" replace>
        <button className={styles.update}>Update Query</button>
      </Link>
    </div>
  )
}
