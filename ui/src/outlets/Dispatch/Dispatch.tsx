import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router'

import { Medication } from '../../views/Collector'

import styles from './Dispatch.module.css'

type SerializedData = {
  medications: Medication[]
  dispatch_date: string
}

type DispatchFormData = {
  generic: string
  brand: string
  frequency: number
  count: number
}

export default function Dispatch() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DispatchFormData>()
  const [dispatchId, setDispatchId] = useState<string>()

  const onSubmit = handleSubmit(
    async ({ brand, count, frequency, generic }) => {
      const preSerialized: SerializedData = {
        medications: [
          {
            brand_name: brand,
            generic_name: generic,
            end_after_n: new Number(count) as number,
            frequency: `PT${frequency}H`,
          },
        ],
        dispatch_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(preSerialized),
        headers: { 'content-type': 'application/json' },
      })
      const data = await response.json()
      const { dispatch_id } = data
      reset()
      setDispatchId(dispatch_id)
    }
  )

  return dispatchId ? (
    <Navigate to={`../inspect/${dispatchId}`} relative="path" />
  ) : (
    <div className={styles.container}>
      <header>Dispatch</header>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.inputField}>
          <label htmlFor="generic">Generic</label>
          <input
            id="generic"
            type="text"
            {...register('generic', { required: true })}
          />
          <span>{errors.generic && '* required'}</span>
        </div>

        <div className={styles.inputField}>
          <label htmlFor="brand">Brand</label>
          <input id="brand" {...register('brand', { required: true })} />
          <span>{errors.brand && '* required'}</span>
        </div>

        <div className={styles.inputField}>
          <label htmlFor="frequency">Frequency</label>
          <input
            type="number"
            id="frequency"
            {...register('frequency', { required: true, min: 1, max: 72 })}
            placeholder="in hours"
          />
          <span>{errors.frequency && '* required'}</span>
        </div>

        <div className={styles.inputField}>
          <label htmlFor="count">Count</label>
          <input
            type="number"
            id="count"
            {...register('count', { required: true, min: 1 })}
          />
          <span>{errors.count && '* required'}</span>
        </div>

        <input type="submit" className={styles.submit} value="Dispatch" />
      </form>
    </div>
  )
}
