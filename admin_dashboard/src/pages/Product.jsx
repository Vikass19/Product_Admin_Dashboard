import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import ProductTable from '../components/products/ProductTable'
import ProductGrid from '../components/products/ProductGrid'

const PAGE_LIMIT = 10 // replaced by URL-based pagination in Phase 9

export default function Products() {
  const [state, setState] = useState({ status: 'loading', products: [], total: 0, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, status: 'loading', error: '' }))

    getProducts({ limit: PAGE_LIMIT, skip: 0, signal: controller.signal })
      .then((data) =>
        setState({
          status: 'success',
          products: data.products,
          total: data.total,
          error: '',
        })
      )
      .catch((err) => {
        if (err.name === 'CanceledError') return
        setState({ status: 'error', products: [], total: 0, error: err.message })
      })

    return () => controller.abort()
  }, [reloadKey])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        {state.status === 'success' && (
          <span className="text-sm text-gray-500">{state.total} total</span>
        )}
      </div>

      {state.status === 'loading' && <Loader />}

      {state.status === 'error' && (
        <ErrorState message={state.error} onRetry={() => setReloadKey((k) => k + 1)} />
      )}

      {state.status === 'success' && state.products.length === 0 && <EmptyState />}

      {state.status === 'success' && state.products.length > 0 && (
        <>
          <ProductTable products={state.products} />
          <ProductGrid products={state.products} />
        </>
      )}
    </div>
  )
}