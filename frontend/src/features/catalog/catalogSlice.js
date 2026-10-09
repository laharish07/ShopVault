import { createSlice } from '@reduxjs/toolkit'
import { apiThunk } from '../../lib/apiThunk'
import { http } from '../../lib/http'
import { logout, sessionExpired } from '../auth/authSlice'

const initialState = { brands: [], categories: [] }

export const fetchCatalog = apiThunk('catalog/fetch', async () => {
  const [brands, categories] = await Promise.all([http.get('/brands'), http.get('/categories')])
  return { brands: brands.data, categories: categories.data }
})

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.brands = action.payload.brands
        state.categories = action.payload.categories
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
  },
})

export const selectBrands = (state) => state.catalog.brands
export const selectCategories = (state) => state.catalog.categories

export default catalogSlice.reducer
