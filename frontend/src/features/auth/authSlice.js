import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { apiThunk } from '../../lib/apiThunk'
import { http } from '../../lib/http'

// `status` stays "loading" until we know whether a valid session cookie exists.
const initialState = { user: null, status: 'loading' }

export const bootstrap = createAsyncThunk('auth/bootstrap', async () => {
  try {
    const { data } = await http.get('/auth/check-auth')
    return data
  } catch {
    return null
  }
})

export const login = apiThunk('auth/login', (credentials) => http.post('/auth/login', credentials).then((res) => res.data))
export const signup = apiThunk('auth/signup', (details) => http.post('/auth/signup', details).then((res) => res.data))
export const verifyOtp = apiThunk('auth/verifyOtp', (otp) => http.post('/auth/verify-otp', { otp }).then((res) => res.data))

export const logout = createAsyncThunk('auth/logout', async () => {
  // Even if the request fails we still drop the local session.
  await http.post('/auth/logout').catch(() => {})
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrap.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'ready'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
      .addMatcher(isAnyOf(login.fulfilled, signup.fulfilled, verifyOtp.fulfilled), (state, action) => {
        state.user = action.payload
      })
  },
})

export const { sessionExpired } = authSlice.actions

export const selectUser = (state) => state.auth.user
export const selectAuthReady = (state) => state.auth.status === 'ready'

export default authSlice.reducer
