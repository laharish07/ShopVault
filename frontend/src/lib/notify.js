import { toast } from 'react-toastify'

// Runs a thunk action (or a plain promise), shows a toast for the outcome and returns the
// result, or `null` when the request failed.
export async function notify(action, successMessage) {
  try {
    const result = await (typeof action.unwrap === 'function' ? action.unwrap() : action)
    if (successMessage) toast.success(successMessage)
    return result ?? true
  } catch (error) {
    if (error?.code === 'ERR_CANCELED') return null
    toast.error(error?.message || 'Something went wrong, please try again')
    return null
  }
}
