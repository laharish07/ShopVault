import { createSlice } from '@reduxjs/toolkit'
import { apiThunk } from '../../lib/apiThunk'
import { http } from '../../lib/http'
import { logout, sessionExpired } from '../auth/authSlice'

const initialState = { items: [], status: 'idle' }

export const fetchAddresses = apiThunk('addresses/fetch', () => http.get('/address').then((res) => res.data))
export const createAddress = apiThunk('addresses/create', (address) =>
  http.post('/address', address).then((res) => res.data)
)
export const updateAddress = apiThunk('addresses/update', ({ id, data }) =>
  http.patch(`/address/${id}`, data).then((res) => res.data)
)
export const deleteAddress = apiThunk('addresses/delete', (id) => http.delete(`/address/${id}`).then((res) => res.data))

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading'
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'ready'
      })
      .addCase(fetchAddresses.rejected, (state) => {
        state.status = 'ready'
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.meta.arg)
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
  },
})

export const selectAddresses = (state) => state.addresses.items
export const selectAddressesReady = (state) => state.addresses.status === 'ready'

export default addressSlice.reducer
