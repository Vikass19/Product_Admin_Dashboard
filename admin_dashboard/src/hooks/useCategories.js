import { useEffect, useState } from 'react'
import { getCategories } from '../services/productService'

export default function useCategories() {
  const [state, setState] = useState({ status: 'loading', categories: [] })

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    getCategories(controller.signal)
      .then((data) => {
        if (!ignore) setState({ status: 'success', categories: data })
      })
      .catch((err) => {
        if (ignore || err.name === 'CanceledError') return
        setState({ status: 'error', categories: [] })
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  return state
}