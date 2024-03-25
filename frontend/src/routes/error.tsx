import { useRouteError } from 'react-router-dom'

function hasMessage(error: unknown): error is { message: string } {
  if (!error) return false
  if (typeof error !== 'object') return false
  if (!('message' in error)) return false
  return true
}

export default function ErrorPage() {
  const error = useRouteError()
  const msg = hasMessage(error) ? error.message : 'An unexpected error has occurred.'

  return (
    <div id='error-page'>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>{msg}</p>
    </div>
  )
}
