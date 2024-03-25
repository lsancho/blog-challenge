import axios from 'axios'
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { removeDataOfStorage, useAuth } from '~/lib/auth'

export default function AuthSignOutPage() {
  const { data } = useAuth()

  useEffect(() => {
    if (data) {
      removeDataOfStorage()
      delete axios.defaults.headers.common['Authorization']
    }
  }, [data])

  if (!data) {
    return <Navigate to='/' />
  }

  return <></>
}
