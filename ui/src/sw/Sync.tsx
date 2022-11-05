import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useLocalStorage } from 'usehooks-ts';

// Attempt sync every 30-seconds
const intervalMs = 30 * 1000

// Enable sync only if we are in the `/collector` route
const syncEnabledPaths = ['/collector']

export default function Sync() {
  const { pathname } = useLocation()
  const [offlineData] = useLocalStorage('offlineData', [])

  useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`Service Worker [Sync] at: ${swUrl}`)
      r && setInterval(() => {
        r.update()

        if (navigator.onLine && syncEnabledPaths.includes(pathname) && offlineData.length > 0) {
          // TODO: add sync logic
          console.log('online.. attempting sync');
        }
      }, intervalMs)
    },
  })

  return null
}