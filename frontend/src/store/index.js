import { configureStore } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import { setUnauthorizedHandler } from '../lib/http'
import auth, { sessionExpired } from '../features/auth/authSlice'
import catalog from '../features/catalog/catalogSlice'
import cart from '../features/cart/cartSlice'
import wishlist from '../features/wishlist/wishlistSlice'
import addresses from '../features/addresses/addressSlice'

export const store = configureStore({
  reducer: { auth, catalog, cart, wishlist, addresses },
})

setUnauthorizedHandler(() => {
  if (!store.getState().auth.user) return

  toast.info('Your session has expired, please sign in again')
  store.dispatch(sessionExpired())
})
