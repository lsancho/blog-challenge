import axios from 'axios'
import useSWRMutation from 'swr/mutation'
import { useAuth } from '~/lib/auth'

export type AuthResponse = {
  token: string
  claims: { sub: string } & Record<string, number | string | boolean>
}

type SignInParams = {
  email: string
  password: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function useSignIn() {
  const fetcher = async (url: string, { arg }: { arg: SignInParams }) => {
    const response = await axios.post(API_BASE_URL + url, arg)
    return response.data as AuthResponse
  }

  const { data, error, trigger, isMutating } = useSWRMutation('/signin', fetcher)
  const { setToken } = useAuth()

  const authenticated = data && !!data?.token

  if (authenticated) {
    setToken(data)
  }

  return {
    trigger,
    loading: isMutating,
    authenticated,
    error
  }
}

type SignUpParams = {
  name: string
  email: string
  password: string
}

export function useSignUp() {
  const fetcher = async (url: string, { arg }: { arg: SignUpParams }) => {
    const response = await axios.post(API_BASE_URL + url, arg)
    return response.data as AuthResponse
  }

  const { data, error, trigger, isMutating } = useSWRMutation('/signup', fetcher)
  const { setToken } = useAuth()

  const authenticated = data && !!data?.token

  if (authenticated) {
    setToken(data)
  }

  return {
    trigger,
    loading: isMutating,
    authenticated,
    error
  }
}
