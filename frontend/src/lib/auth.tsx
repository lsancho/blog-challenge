import axios from 'axios'
import { decode } from '~/lib/paseto'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AuthResponse } from '~/routes/auth/hooks'

// @deprecated
function decodeToken(token: string) {
  let decoded = null
  try {
    decoded = decode(token)
  } catch (error) {
    console.debug('paseto', error)
  }
  return decoded
}

const DATA_SESSION_KEY = 'AUTH:TOKEN'

async function setDataInStorage<T>(token: T) {
  sessionStorage.setItem(DATA_SESSION_KEY, JSON.stringify(token))
}

async function removeDataOfStorage() {
  sessionStorage.removeItem(DATA_SESSION_KEY)
}

function getDataFromStorage<T>() {
  try {
    const data = sessionStorage.getItem(DATA_SESSION_KEY)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    return null
  }
}

type AuthData = AuthResponse
type AuthContextType = {
  data: AuthData | null
  setToken: (data: AuthData) => Promise<void>
}
const AuthContext = createContext<AuthContextType>({
  data: null,
  setToken: async () => {}
})

type AuthProviderProps = { children: React.ReactNode }
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [data, setData] = useState(getDataFromStorage<AuthData>())

  const save = async (data: AuthData) => {
    setData(data)
  }

  useEffect(() => {
    if (data) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
      setDataInStorage(data)
    } else {
      delete axios.defaults.headers.common['Authorization']
      removeDataOfStorage()
    }
  }, [data])

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      data,
      setToken: save
    }),
    [data]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthProvider
