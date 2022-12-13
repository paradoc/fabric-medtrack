import React, { ChangeEventHandler, useCallback, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'
import { compose, values, includes } from 'rambda'

import styles from './Login.module.css'

// In a real environment, this should be on backend.
const _CREDENTIALS: { [key: string]: string } = {
  medtrac: 'password',
}

export default function Login() {
  const [isLoggedIn, setIsLoggedIn] = useSessionStorage('login', false)
  const [formState, setFormState] = useState({
    username: false,
    password: false,
  })
  const [loginError, setLoginError] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const submit = useCallback(() => {
    if (usernameRef.current && passwordRef.current) {
      const userVal = usernameRef.current.value
      const passVal = passwordRef.current.value
      setLoginError(
        !(userVal in _CREDENTIALS) || _CREDENTIALS[userVal] !== passVal
      )
      setIsLoggedIn(true)
    }
  }, [usernameRef, passwordRef])

  const checkNotEmpty = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const { alt } = e.currentTarget ?? {}
      if (alt) {
        setFormState((fs) => ({
          ...fs,
          [alt]: true,
        }))
      }
    },
    []
  )

  return isLoggedIn ? (
    <Navigate to="/dispatcher" replace={true} />
  ) : (
    <div className={styles.login}>
      <div className={styles.logo}>
        <strong>Mars</strong>
        <span>Drugstore</span>
      </div>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="username"
          ref={usernameRef}
          onChange={checkNotEmpty}
          alt="username"
          className={loginError ? styles['-error'] : ''}
        />
        <input
          type="password"
          ref={passwordRef}
          onChange={checkNotEmpty}
          alt="password"
          className={loginError ? styles['-error'] : ''}
        />
        <button
          disabled={compose(includes(false), values)(formState)}
          onClick={submit}
        >
          Login
        </button>
      </div>
    </div>
  )
}
