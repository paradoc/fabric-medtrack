import React, { useRef } from 'react'
import QRCode from 'react-qr-code'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
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
  const ref = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => ref.current,
  })

  return id && data && data.length > 0 && !error ? (
    <div className={styles.container}>
      <header>Dispatch Information</header>
      <div className={styles.qr} ref={ref}>
        <style type="text/css" media="print">
          {
            '\
          @page { size: portrait; }\
        '
          }
        </style>
        <header>Mars Drugstore</header>
        <span>Please scan QR code below and log your medication intake.</span>
        <div>
          <QRCode
            size={256}
            style={{ height: 'auto', maxWidth: 256, width: '100%' }}
            value={QR_URL(id)}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className={styles.meta}>
          <span>{data[0].dispatch_id}</span>
          <span>{data[0].dispatch_date}</span>
        </div>
      </div>
      <button onClick={handlePrint}>Print</button>
    </div>
  ) : (
    <div>error</div>
  )
}
