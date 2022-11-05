import React, { PropsWithChildren, useLayoutEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFetch } from 'usehooks-ts'

import styles from './Collector.module.css'


// type History struct {
// 	EndedAt    string   `json:"ended_at"`
// 	StartedAt  string   `json:"started_at"`
// 	Timestamps []string `json:"timestamps"`
// }

// type Medication struct {
// 	BrandName   string `json:"brand_name"`
// 	EndAfterN   int    `json:"end_after_n"`
// 	Frequency   string `json:"frequency"`
// 	GenericName string `json:"generic_name"`
// }

// type Asset struct {
// 	DispatchID string     `json:"dispatch_id"`
// 	History    History    `json:"history"`
// 	Medication Medication `json:"medication"`
// 	UserID     string     `json:"user_id"`
// }


interface Medication {
  nameOrId: string
  frequency: string
  isComplete: boolean 
}

interface RxHistory {
  startedAt: string
  endedAt: string | null
  timestamps: string[]
}

interface Session {
  userIdOrName: string | null
  dispatchId: string
  rxHistory: RxHistory
  medication: Medication
}

interface DataProps {
  rx: string | null
  setComponentData: (a: any) => void
}

function Data({ rx, children, setComponentData }: PropsWithChildren<DataProps>) {
  if (!rx)
    return <>{children}</>

  const { data, error } = useFetch<Session>('todo: integrate')

  useLayoutEffect(() => {
    if (data) {
      setComponentData({ data })
    } else if (error || !data) {
      setComponentData({})
    }
  }, [data, error])

  return <>{children}</>
}

export default function Collector() {
  const [session, setSession] = useState<Session>()
  const [hasFetched, setHasFetched] = useState(false)
  const [displayQRScanner, setDisplayQRScanner] = useState<boolean>()
  const { search } = useLocation()

  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  const rx = searchParams.get('rx')

  useLayoutEffect(() => {
    if (session !== undefined) {
      if (Object.keys(session).length > 0) {
        setDisplayQRScanner(false)
      } else {
        setDisplayQRScanner(true)
      }
      setHasFetched(true)
    }
  }, [session])

  return (
    <div className={styles.collector}>
      <Data rx={rx} setComponentData={setSession}>
        <header>Hi {session?.userIdOrName ?? 'there'}!</header>
      </Data>
      <div className={styles.layout}>
        {hasFetched && displayQRScanner && <>todo: QR here</>}
      </div>
    </div>
  )
}