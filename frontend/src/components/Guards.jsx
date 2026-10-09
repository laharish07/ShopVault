import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectAuthReady, selectUser } from '../features/auth/authSlice'
import Loader from './Loader'

const homeFor = (user) => (user.isAdmin ? '/admin/products' : '/')

// Signed-in and verified users only.
export function RequireAuth() {
  const ready = useSelector(selectAuthReady)
  const user = useSelector(selectUser)
  const location = useLocation()

  if (!ready) return <Loader fullPage />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (!user.isVerified) return <Navigate to="/verify-email" replace />

  return <Outlet />
}

export function RequireShopper() {
  const user = useSelector(selectUser)
  return user?.isAdmin ? <Navigate to="/admin/products" replace /> : <Outlet />
}

export function RequireAdmin() {
  const user = useSelector(selectUser)
  return user?.isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

// Sign-in / sign-up pages: signed-in users are sent on to where they belong.
export function GuestOnly() {
  const ready = useSelector(selectAuthReady)
  const user = useSelector(selectUser)

  if (!ready) return <Loader fullPage />
  if (user) return <Navigate to={user.isVerified ? homeFor(user) : '/verify-email'} replace />

  return <Outlet />
}
