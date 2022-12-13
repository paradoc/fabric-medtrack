import * as React from 'react'
import { Navigate } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'

export default function Dispatcher() {
  const [isLoggedIn] = useSessionStorage('login', false)

  return !isLoggedIn ? <Navigate to="/login" /> : <div>dispatcher</div>
}
