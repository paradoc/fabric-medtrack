import * as React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { pwaInfo } from 'virtual:pwa-info'

// eslint-disable-next-line no-console
console.log(pwaInfo)

const intervalMS = 30 * 1000 // 30-second interval

export default function Sync() {
  useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`Service Worker [Sync] at: ${swUrl}`)
      r && setInterval(() => {
        r.update()

        // TODO: Add sync logic here.
        if (navigator.onLine) {
          console.log('online');
        } else {
          console.log('offline');
        }
      }, intervalMS)
    },
  })

  return null
}