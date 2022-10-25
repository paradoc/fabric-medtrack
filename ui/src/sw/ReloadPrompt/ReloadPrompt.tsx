import * as React from 'react'
import styles from './ReloadPrompt.module.css'

import { useRegisterSW } from 'virtual:pwa-register/react'
import { pwaInfo } from 'virtual:pwa-info'

// eslint-disable-next-line no-console
console.log(pwaInfo)

export default function ReloadPrompt() {
  // replaced dynamically
  const buildDate = '__DATE__'
  // replaced dyanmicaly
  const reloadSW = '__RELOAD_SW__'

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // eslint-disable-next-line no-console
      console.log(`Service Worker [ReloadPrompt] at: ${swUrl}`)
      // @ts-expect-error just ignore
      if (reloadSW === 'true') {
        r && setInterval(() => {
          // eslint-disable-next-line no-console
          console.log('Checking for sw update')
          r.update()
        }, 20000 /* 20s for testing purposes */)
      }
      else {
        // eslint-disable-next-line prefer-template,no-console
        console.log('SW Registered: ' + r)
      }
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      { (offlineReady || needRefresh)
          && <div className={styles['ReloadPrompt-toast']}>
            <div className={styles['ReloadPrompt-message']}>
              { offlineReady
                ? <span>App ready to work offline</span>
                : <span>New content available, click on reload button to update.</span>
              }
            </div>
            { needRefresh && <button className={styles['ReloadPrompt-toast-button']} onClick={() => updateServiceWorker(true)}>Reload</button> }
            <button className={styles['ReloadPrompt-toast-button']} onClick={() => close()}>Close</button>
          </div>
      }
      <div className={styles['ReloadPrompt-date']}>{buildDate}</div>
    </div>
  )
}