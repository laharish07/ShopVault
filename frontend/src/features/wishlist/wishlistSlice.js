import { createSlice } from '@reduxjs/toolkit'
import { apiThunk } from '../../lib/apiThunk'
import { http } from '../../lib/http'
import { logout, sessionExpired } from '../auth/authSlice'

const initialState = { items: [], status: 'idle' }

export const fetchWishlist = apiThunk('wishlist/fetch', () => http.get('/wishlist').then((res) => res.data))
export const addToWishlist = apiThunk('wishlist/add', (product) =>
  http.post('/wishlist', { product }).then((res) => res.data)
)
export const updateWishlistNote = apiThunk('wishlist/note', ({ id, note }) =>
  http.patch(`/wishlist/${id}`, { note }).then((res) => res.data)
)
export const removeFromWishlist = apiThunk('wishlist/remove', (id) =>
  http.delete(`/wishlist/${id}`).then((res) => res.data)
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading'
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'ready'
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.status = 'ready'
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.items.some((item) => item._id === action.payload._id)) state.items.unshift(action.payload)
      })
      .addCase(updateWishlistNote.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.meta.arg)
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
  },
})

export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistReady = (state) => state.wishlist.status === 'ready'
export const selectWishlistEntry = (productId) => (state) =>
  state.wishlist.items.find((item) => item.product._id === productId)

export default wishlistSlice.reducer
