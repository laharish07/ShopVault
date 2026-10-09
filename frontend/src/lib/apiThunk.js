import { createAsyncThunk } from '@reduxjs/toolkit'

// createAsyncThunk wrapper that rejects with the `{ message, status }` object from lib/http.
export const apiThunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await request(arg)
    } catch (error) {
      return rejectWithValue(error)
    }
  })
