import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { useFetch, useLocalStorage } from 'usehooks-ts'
import { difference, prop } from 'rambda'
import dayjs from 'dayjs'
import produce from 'immer'

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
  [key: string]: {
    // DispatchId to local session map
    history: RxHistory
    medications: Medication[]
  }
}

interface PendingSyncData {
  [key: string]: string[]
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
      <input
        type="checkbox"
        id={id}
        onChange={(e) => onClick(e.currentTarget.checked)}
      />
      <label htmlFor={id}>
        {data.generic_name} {data.brand_name}
      </label>
    </div>
  )
}

function Data({ rx, children, onError }: PropsWithChildren<DataProps>) {
  const [offlineData, setOfflineData] = useLocalStorage<OfflineData>(
    'offlineData',
    {}
  )
  const [pendingSync, setPendingSync] = useLocalStorage<PendingSyncData>(
    'pendingSync',
    {}
  )
  const [toggleCount, setToggleCount] = useState<number>(0)
  const { data, error } = useFetch<Session[]>(`/api/read/${rx}`)
  const currData = offlineData[rx ?? ''] ?? null
  const isCompleted = currData?.history.ended_at !== '' ?? false

  const onClickToggle = useCallback(
    (toggled: boolean) => {
      if (toggled) {
        setToggleCount(toggleCount + 1)
      } else {
        setToggleCount(toggleCount - 1)
      }
    },
    [toggleCount]
  )

  const submit = useCallback(() => {
    if (rx && rx in pendingSync) {
      const now = dayjs().format('YYYY-MM-DDTHH:mm:ssZ[Z]')
      const updatedPendingSyncData = produce(pendingSync[rx], (data) => {
        data.push(now)
      })
      setPendingSync({ [rx]: updatedPendingSyncData })
      // window.location.reload()
    }
  }, [pendingSync, rx])

  // Fetches remote data, caches locally, and prepares to sync
  useEffect(() => {
    if (rx && data && data.length > 0) {
      const [{ history, medications }] = data

      if (currData) {
        const session = { ...currData, history, medications }
        const diff = difference(currData.history.timestamps, history.timestamps)
        setOfflineData({ [rx]: session })
        if (currData.history.ended_at === '' && diff.length > 0) {
          setPendingSync({ [rx]: diff })
        } else if (
          history.ended_at !== '' ||
          history.timestamps.length >
            Math.max(...medications.map<number>(prop('end_after_n')))
        ) {
          setPendingSync({ [rx]: [] })
        }
      } else {
        // assume all data has been synced
        setOfflineData({
          ...offlineData,
          [rx]: {
            history,
            medications,
          },
        })
        setPendingSync({ [rx]: [] })
      }
    }
  }, [rx, currData, data])

  // Trigger onError if we have no data available and we have received an error either online or offline
  useEffect(() => {
    if (error?.message.includes('NetworkError') && !currData) {
      onError()
    }
  }, [currData, error, onError])

  return (
    <div className={styles.container}>
      {children}
      {currData && (
        <div className={styles.content}>
          {isCompleted ? (
            <div>ありがとう</div>
          ) : (
            <>
              <div className={styles.list}>
                {currData.medications.map(
                  (medication: Medication, i: number) => (
                    <ListItem
                      data={medication}
                      key={i}
                      onClick={onClickToggle}
                    />
                  )
                )}
              </div>
              <button
                onClick={submit}
                disabled={!(toggleCount === currData?.medications.length ?? 0)}
              >
                OK
              </button>
            </>
          )}
        </div>
      )}
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
      <Data rx={rx} onError={() => setDisplayQRScanner(true)}>
        <header>Hi there!</header>
      </Data>
      <div className={styles.layout}>
        {displayQRScanner && <>todo: QR here</>}
      </div>
    </div>
  )
}
