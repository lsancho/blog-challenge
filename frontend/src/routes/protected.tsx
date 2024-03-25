import { Navbar, NavbarContent, NavbarItem } from '@nextui-org/react'
import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export const ProtectedRoute = () => {
  const { data } = useAuth()

  if (!data) {
    return <Navigate to='/auth' />
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='flex flex-col'>
        <Navbar>
          <NavbarContent className='hidden gap-4 sm:flex' justify='center'>
            <NavbarItem>
              <NavLink color='foreground' to='/'>
                Home
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink color='foreground' to='/post'>
                Post
              </NavLink>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
        <Outlet />
      </div>
    </main>
  )
}
