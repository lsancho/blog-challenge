import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { ProtectedRoute } from './protected'
import HomePage, { loader as homeLoader } from './home'
import ErrorPage from './error'
import AuthPage from './auth'
import Post from './post'

const Routes = () => {
  const { data } = useAuth()

  //   const routesForPublic = []

  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRoute />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          loader: homeLoader,
          element: <HomePage />
        },
        {
          path: '/post',
          element: <Post />
        }
      ]
    }
  ]

  const routesForNotAuthenticatedOnly = [
    {
      path: '/auth',
      element: <AuthPage />,
      errorElement: <ErrorPage />
    }
  ]

  const router = createBrowserRouter([
    // ...routesForPublic,
    ...routesForNotAuthenticatedOnly,
    ...routesForAuthenticatedOnly
  ])

  return <RouterProvider router={router} />
}

export default Routes
