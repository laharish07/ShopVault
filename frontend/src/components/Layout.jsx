import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { selectUser } from '../features/auth/authSlice'
import { fetchAddresses } from '../features/addresses/addressSlice'
import { fetchCart } from '../features/cart/cartSlice'
import { fetchCatalog } from '../features/catalog/catalogSlice'
import { fetchWishlist } from '../features/wishlist/wishlistSlice'
import Footer from './Footer'
import Navbar, { MobileSearch } from './Navbar'

// Frame for every signed-in page. Loads the data the whole app leans on once per session.
export default function Layout() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const userId = user._id
  const isAdmin = user.isAdmin

  useEffect(() => {
    dispatch(fetchCatalog())

    if (!isAdmin) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
      dispatch(fetchAddresses())
    }
  }, [dispatch, userId, isAdmin])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {!isAdmin && <MobileSearch />}
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
