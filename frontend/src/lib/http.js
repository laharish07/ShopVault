import axios from 'axios'

let handleUnauthorized = () => {}

export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler
}

export const http = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
})

// Every failed request rejects with a plain `{ message, status }` object, so callers
// never have to dig through axios error shapes.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status
    const message = error.response
      ? error.response.data?.message || 'Something went wrong, please try again'
      : 'Cannot reach the server, please check your connection'

    // A 401 anywhere outside the auth screens means the session is gone.
    if (status === 401 && !error.config?.url?.startsWith('/auth/')) handleUnauthorized()

    return Promise.reject({ message, status })
  }
)
