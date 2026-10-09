import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAdmin, RequireAuth, RequireShopper } from './components/Guards'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import AccountPage from './features/addresses/AccountPage'
import AdminOrdersPage from './features/admin/AdminOrdersPage'
import AdminProductsPage from './features/admin/AdminProductsPage'
import ProductFormPage from './features/admin/ProductFormPage'
import ForgotPasswordPage from './features/auth/ForgotPasswordPage'
import LoginPage from './features/auth/LoginPage'
import ResetPasswordPage from './features/auth/ResetPasswordPage'
import SignupPage from './features/auth/SignupPage'
import VerifyEmailPage from './features/auth/VerifyEmailPage'
import { bootstrap } from './features/auth/authSlice'
import CartPage from './features/cart/CartPage'
import CheckoutPage from './features/orders/CheckoutPage'
import OrderDetailPage from './features/orders/OrderDetailPage'
import OrdersPage from './features/orders/OrdersPage'
import HomePage from './features/products/HomePage'
import ProductPage from './features/products/ProductPage'
import WishlistPage from './features/wishlist/WishlistPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(bootstrap())
  }, [dispatch])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/products/:id" element={<ProductPage />} />

            <Route element={<RequireShopper />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/new" element={<ProductFormPage />} />
              <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}
