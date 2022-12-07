import React, { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFetch, useLocalStorage } from 'usehooks-ts'
import { difference, prop } from 'rambda'

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
  brand_name: string
  generic_name: string
  frequency: string
  end_after_n: number
}

interface RxHistory {
  started_at: string
  ended_at: string | null
  timestamps: string[]
}

interface Session {
  dispatch_id: string
  history: RxHistory
  medications: Medication[]
}

interface DataProps {
  rx: string | null
  onError: () => void
}

interface OfflineData {
  [key: string]: { // DispatchId to local session map
    history: RxHistory
    medications: Medication[]
  }
}

interface ListItemProps {
  data: Medication
  key: number
  onClick: (a: boolean) => void
}

function ListItem({ data, key, onClick }: ListItemProps) {
  const id = `${data.generic_name}-${data.brand_name}-${key}`
  return (
    <div>
      <input type="checkbox" id={id} onChange={(e) => onClick(e.currentTarget.checked)} />
      <label htmlFor={id}>{data.generic_name} {data.brand_name}</label>
    </div>
  )
}

function Data({ rx, children, onError }: PropsWithChildren<DataProps>) {
  const [offlineData, setOfflineData] = useLocalStorage<OfflineData>('offlineData', {} as OfflineData)
  const [, setPendingSync] = useLocalStorage<any>('pendingSync', {} as any)
  const [toggleCount, setToggleCount] = useState<number>(0)
  const { data, error } = useFetch<Session[]>(`http://localhost:8888/read/${rx}`)

  const onClickToggle = useCallback((toggled: boolean) => {
    if (toggled) {
      setToggleCount(toggleCount + 1)
    } else {
      setToggleCount(toggleCount - 1)
    }
  }, [toggleCount])

  // Fetches remote data, caches locally, and prepares to sync
  useEffect(() => {
    if (rx && data && data.length > 0) {
      const [{ history, medications }] = data

      if (rx in offlineData) {
        const session = { ...offlineData[rx], history, medications }

        const diff = difference(offlineData[rx].history.timestamps, history.timestamps)
        if (offlineData[rx].history.ended_at === "" && diff.length > 0) {
          setOfflineData({ [rx]: session })
          setPendingSync({ [rx]: diff })
        } else if (history.ended_at !== "" || (history.timestamps.length > Math.max(...medications.map(prop('end_after_n'))))) {
          setPendingSync({ [rx]: [] })
        }
      } else {
        // assume all data has been synced
        setOfflineData((
          {
            ...offlineData,
            [rx]: {
              history,
              medications
            }
          }
        ))
      }
    }
  }, [rx, offlineData, data])

  // Trigger onError if we have no data available and we have received an error either online or offline
  useEffect(() => {
    if (error?.message.includes('NetworkError') && !((rx ?? '') in offlineData)) {
      onError()
    }
  }, [rx, offlineData, error, onError])

  return (
    <div>
      {children}
      {rx && (rx in offlineData) && 
        offlineData[rx].medications.map((medication, i) => <ListItem data={medication} key={i} onClick={onClickToggle} />)
      }
      <button disabled={!(toggleCount === offlineData[rx ?? '']?.medications.length ?? 0)}>OK</button>
    </div>
    )
}

export default function Collector() {
  const [displayQRScanner, setDisplayQRScanner] = useState<boolean>()
  const { search } = useLocation()
  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  const rx = searchParams.get('rx')

  return (
    <div className={styles.collector}>
      <button onClick={() => window.location.reload()}>click to rleaod</button>
      <Data rx={rx} onError={() => setDisplayQRScanner(true)}>
        <header>Hi there!</header>
      </Data>
      <div className={styles.layout}>
        {displayQRScanner && <>todo: QR here</>}
      </div>
    </div>
  )
}