import React, { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { sync } from '../store/collector'

// Attempt sync every 5-seconds
const intervalMs = 5 * 1000

// Enable sync only if we are in the `/collector` route
const syncEnabledPaths = ['/collector']

export default function Sync() {
  const { pathname, search } = useLocation()
  const dispatch = useDispatch<any>()
  const searchParams = useMemo(() => new URLSearchParams(search), [search])
  const rx = searchParams.get('rx')

  useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`Service Worker [Sync] at: ${swUrl}`)
      r &&
        setInterval(() => {
          r.update()

          if (navigator.onLine && syncEnabledPaths.includes(pathname)) {
            const pendingSync = JSON.parse(
              window.localStorage.getItem('pendingSync') ?? '{}'
            )
            if (rx && rx in pendingSync && pendingSync[rx].length > 0) {
              console.log('syncing offline data..')
              dispatch(sync(rx))
            }
          }
        }, intervalMs)
    },
  })

  return null
}
