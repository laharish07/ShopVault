import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { apiThunk } from '../../lib/apiThunk'
import { http } from '../../lib/http'
import { logout, sessionExpired } from '../auth/authSlice'

const emptySummary = { subtotal: 0, shipping: 0, tax: 0, total: 0 }
const initialState = { items: [], summary: emptySummary, status: 'idle' }

const unwrapCart = (request) => request.then((res) => res.data)

export const fetchCart = apiThunk('cart/fetch', () => unwrapCart(http.get('/cart')))
export const addToCart = apiThunk('cart/add', ({ product, quantity = 1 }) =>
  unwrapCart(http.post('/cart', { product, quantity }))
)
export const updateCartItem = apiThunk('cart/update', ({ id, quantity }) =>
  unwrapCart(http.patch(`/cart/${id}`, { quantity }))
)
export const removeCartItem = apiThunk('cart/remove', (id) => unwrapCart(http.delete(`/cart/${id}`)))

// Every cart endpoint answers with the full cart, so one reducer keeps state in sync.
const cartChanged = isAnyOf(fetchCart.fulfilled, addToCart.fulfilled, updateCartItem.fulfilled, removeCartItem.fulfilled)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading'
      })
      .addCase(fetchCart.rejected, (state) => {
        state.status = 'ready'
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
      .addMatcher(cartChanged, (state, action) => {
        state.items = action.payload.items
        state.summary = action.payload.summary
        state.status = 'ready'
      })
  },
})

export const selectCartItems = (state) => state.cart.items
export const selectCartSummary = (state) => state.cart.summary
export const selectCartReady = (state) => state.cart.status === 'ready'
export const selectCartCount = (state) => state.cart.items.reduce((count, item) => count + item.quantity, 0)

export default cartSlice.reducer
