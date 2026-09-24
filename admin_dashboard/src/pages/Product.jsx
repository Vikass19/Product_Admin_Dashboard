import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'

export default function Products() {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    const controller = new AbortController()

    getProducts({ limit: 5, signal: controller.signal })
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) => {
        if (err.name === 'CanceledError') return
        setState({ loading: false, error: err.message, data: null })
      })

    return () => controller.abort()
  }, [])

  if (state.loading) return <p className="p-6">Loading...</p>
  if (state.error) return <p className="p-6 text-red-600">{state.error}</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products (Axios test)</h1>
      <ul className="list-disc pl-5">
        {state.data.products.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  )
}