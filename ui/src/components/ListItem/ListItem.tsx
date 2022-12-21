import React, { useEffect, useRef } from 'react'
import { Medication } from '../../views/Collector'

import styles from './ListItem.module.css'

interface Props {
  data: Medication
  onClick: (a: boolean) => void
  shouldReset: boolean
}

export default function ListItem({
  data: { brand_name, generic_name },
  onClick,
  shouldReset,
}: Props) {
  const id = `${generic_name}-${brand_name}`
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldReset && ref.current !== null) {
      ref.current.checked = false
    }
  }, [ref, shouldReset])

  return (
    <div className={styles.listItem}>
      <input
        type="checkbox"
        id={id}
        onChange={(e) => onClick(e.currentTarget.checked)}
        ref={ref}
        data-testid="checkbox"
      />
      <label htmlFor={id}>
        <strong>{generic_name}</strong> <span>{brand_name}</span>
      </label>
    </div>
  )
}
