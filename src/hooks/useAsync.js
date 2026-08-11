import { useCallback, useEffect, useState } from 'react'

export default function useAsync(fn, deps) {
  const [state, setState] = useState({ status: 'loading', data: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    fn().then(
      (data) => alive && setState({ status: 'success', data }),
      () => alive && setState({ status: 'error', data: null }),
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  const retry = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, retry }
}
