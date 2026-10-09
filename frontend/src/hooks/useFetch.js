import { useCallback, useEffect, useRef, useState } from 'react'

// Small data-fetching hook: runs `request` on mount and whenever `deps` change, ignores
// responses from stale requests and exposes `reload` / `setData` for local updates.
export function useFetch(request, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const requestRef = useRef(request)
  requestRef.current = request

  const run = useCallback(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    requestRef
      .current()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }))

    return () => {
      active = false
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => run(), [run, ...deps])

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }))
  }, [])

  return { ...state, reload: run, setData }
}
