import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { useFetch, useLocalStorage } from 'usehooks-ts'
import { QrReader } from 'react-qr-reader'
import { equals, difference, prop, last, head, sort } from 'rambda'
import dayjs from 'dayjs'
import produce from 'immer'

import ListItem from '../../components/ListItem'

import Refresh from '../../assets/refresh.svg'

import styles from './Collector.module.css'

export interface Medication {
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

export interface Session {
  dispatch_id: string
  dispatch_date: string
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

const ONE_MINUTE = 60 * 1000

const LastInputTimer = ({ since }: { since: string }) => {
  const [lastInput, setLastInput] = useState(dayjs().from(since, true))

  useEffect(() => {
    const id = setInterval(() => {
      setLastInput(dayjs().from(since, true))
    }, ONE_MINUTE)
    return () => {
      clearInterval(id)
    }
  }, [since])

  return <strong>{lastInput}</strong>
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
  const [shouldResetList, setShouldResetList] = useState(false)
  const [isDue, setIsDue] = useState(false)
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

  useEffect(() => {
    if (shouldResetList) {
      setToggleCount(0)
      setShouldResetList(false)
    }
  }, [shouldResetList])

  const submit = useCallback(() => {
    if (rx && rx in pendingSync) {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const updatedPendingSyncData = produce(pendingSync[rx], (data) => {
        data.push(now)
      })
      setPendingSync({ ...pendingSync, [rx]: updatedPendingSyncData })
    }
    setShouldResetList(true)
  }, [currData, pendingSync, rx])

  // Fetches remote data, caches locally, and prepares to sync
  useEffect(() => {
    if (rx && data && data.length > 0) {
      const [{ history, medications }] = data

      if (!currData) {
        // Initialize local cache
        setOfflineData((od) => ({
          ...od,
          [rx]: {
            history,
            medications,
          },
        }))
        setPendingSync({ ...pendingSync, [rx]: [] })
      } else {
        const newHistory = produce(history, (h) => {
          const tsDiff = difference(pendingSync[rx], h.timestamps)
          if (pendingSync[rx].length > h.timestamps.length) {
            h.timestamps.push(...tsDiff)
          }
          if (h.started_at === '' && pendingSync[rx].length > 0) {
            h.started_at = head(pendingSync[rx]) as string
          }
          if (
            h.ended_at === '' &&
            h.timestamps.length >=
              Math.max(...medications.map<number>(prop('end_after_n')))
          ) {
            h.ended_at = last(pendingSync[rx]) as string
          }
        })
        if (!equals(currData, { history: newHistory, medications })) {
          setOfflineData((od) => ({
            ...od,
            [rx]: {
              history: newHistory,
              medications,
            },
          }))
        }
      }
    }
  }, [rx, currData, pendingSync, data])

  // Trigger onError if we have no data available or we have received an error
  useEffect(() => {
    if (
      (error?.message.includes('NetworkError') && data === undefined) ||
      (data && data.length === 0)
    ) {
      onError()
    }
  }, [data, error, onError])

  useEffect(() => {
    if (currData) {
      const { medications, history } = currData
      const [{ frequency }] = medications
      const latest = dayjs(last(history.timestamps) as string)
      const dur = dayjs.duration(frequency)
      const nextSchedule = latest.add(dur)
      setIsDue(dayjs().isSameOrAfter(nextSchedule))
    }
  }, [currData])

  return (
    <div className={styles.container}>
      {children}
      {currData && (
        <div
          className={[
            styles.content,
            currData.history.timestamps.length > 0
              ? styles['-three-layer']
              : '',
          ].join(' ')}
        >
          {isCompleted ? (
            <div className={styles.completed}>
              <strong>Thank you for your compliance!</strong>
              <span>
                {pendingSync[rx ?? ''].length > 0
                  ? 'Please go online to sync your data.'
                  : 'You may delete this application from your home screen.'}
              </span>
            </div>
          ) : (
            <>
              {isDue ? (
                <div className={styles.reminder}>
                  <strong>Did you miss your medications?</strong>
                  <span>
                    Please tap on the medications below and press OK if you have
                    taken it already.
                  </span>
                </div>
              ) : (
                currData.history.timestamps.length > 0 && (
                  <div className={styles.reminder}>
                    <span>It's been</span>
                    <LastInputTimer
                      since={
                        head(
                          sort(
                            (a: string, b: string) =>
                              dayjs(b).isSameOrAfter(dayjs(a)) ? 1 : -1,
                            currData?.history.timestamps
                          )
                        ) as string
                      }
                    />
                    <span>since your last input.</span>
                  </div>
                )
              )}
              <div className={styles.list}>
                {currData.medications.map(
                  (medication: Medication, i: number) => (
                    <ListItem
                      data={medication}
                      key={i}
                      onClick={onClickToggle}
                      shouldReset={shouldResetList}
                    />
                  )
                )}
              </div>
              <button
                onClick={submit}
                disabled={!(toggleCount === currData?.medications.length ?? 0)}
                className={styles.submit}
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
        <header>
          <span>Hi there!</span>
          <img
            src={Refresh}
            alt="refresh"
            onClick={() => window.location.reload()}
            className={styles.refresh}
          />
        </header>
      </Data>
      {displayQRScanner && (
        <div className={styles.qrScanner}>
          Please scan your QR code
          <QrReader
            constraints={{ facingMode: { ideal: 'environment' } }}
            onResult={(result) => {
              if (!!result) {
                window.location.replace(result?.getText())
              }
            }}
            className={styles.scanner}
          />
        </div>
      )}
    </div>
  )
}
