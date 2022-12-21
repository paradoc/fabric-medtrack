import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router'

import styles from './Query.module.css'

type QueryFormData = {
  generic: string
  start: string
  end: string
}

export default function Query() {
  const [query, setQuery] = useState<string>()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QueryFormData>()

  const onSubmit = handleSubmit(async ({ generic, start, end }) => {
    setQuery(`./query?g=${generic}&s=${start}&e=${end}`)
    reset()
  })

  return query ? (
    <Navigate to={query} relative="path" />
  ) : (
    <form className={styles.container} onSubmit={onSubmit}>
      <div className={styles.inputField}>
        <label htmlFor="generic">Generic</label>
        <input
          id="generic"
          type="text"
          {...register('generic', { required: true })}
          placeholder="comma delimited (ie. med1,med2)"
          data-testid="generic"
        />
        <span>{errors.generic && '* required'}</span>
      </div>

      <div className={styles.inputField}>
        <label htmlFor="start">Start</label>
        <input
          id="start"
          type="date"
          {...register('start', { required: true })}
          data-testid="start"
        />
        <span>{errors.start && '* required'}</span>
      </div>

      <div className={styles.inputField}>
        <label htmlFor="end">End</label>
        <input
          id="end"
          type="date"
          {...register('end', { required: true })}
          data-testid="end"
        />
        <span>{errors.end && '* required'}</span>
      </div>

      <input
        type="submit"
        className={styles.submit}
        value="Query"
        data-testid="submit"
      />
    </form>
  )
}
