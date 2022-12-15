import React from 'react'
import QRCode from 'react-qr-code'
import { useParams } from 'react-router-dom'
import { useFetch } from 'usehooks-ts'
import { DispatchData } from '../../views/Collector'

import styles from './Inspect.module.css'

const _DOMAIN = '__DOMAIN__'
const _PATH = '/collector'
const _PARAMS = '?rx='

const QR_URL = (dispatchId: string) => _DOMAIN + _PATH + _PARAMS + dispatchId

export default function Inspect() {
  const { id } = useParams()
  const { data, error } = useFetch<DispatchData[]>(`/api/read/${id}`)

  console.log(data)

  return id && data && data.length > 0 && !error ? (
    <div className={styles.container}>
      <header>Dispatch Information</header>
      <div className={styles.qr}>
        <div>
          <div>todo data</div>
        </div>
        <QRCode
          size={256}
          style={{ height: 'auto', maxWidth: 256, width: '100%' }}
          value={QR_URL(id)}
          viewBox={`0 0 256 256`}
        />
      </div>
    </div>
  ) : (
    <div>error</div>
  )
}
