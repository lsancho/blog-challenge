import axios from 'axios'
import useSWRMutation from 'swr/mutation'

type PostResponse = {
  id: string
  version: number
}

type PostParams = {
  id?: string
  user_id: string
  title: string
  content: string
  image_url: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function useEditPost() {
  const fetcher = async (url: string, { arg }: { arg: PostParams }) => {
    const response = await axios.post(API_BASE_URL + url, arg)
    return response.data as PostResponse
  }

  const { data, error, trigger, isMutating } = useSWRMutation('/post', fetcher)

  return {
    trigger,
    data,
    loading: isMutating,
    error
  }
}
