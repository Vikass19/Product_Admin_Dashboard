import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/productService'
import { getRange, getSkip, getTotalPages, parsePagination } from '../utils/pagination'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import PageSizeSelect from '../components/common/PageSizeSelect'
import ProductTable from '../components/products/ProductTable'
import ProductGrid from '../components/products/ProductGrid'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, limit } = parsePagination(searchParams)

  const [state, setState] = useState({ status: 'loading', products: [], total: 0, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  // Update URL params without losing other params (search, sort... added later)
  function updateParams(changes, { replace = false } = {}) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(changes).forEach(([key, value]) => next.set(key, String(value)))
        return next
      },
      { replace }
    )
  }

  // Rewrite invalid URLs (?page=abc, ?limit=500) to their safe values
  useEffect(() => {
    const rawPage = searchParams.get('page')
    const rawLimit = searchParams.get('limit')
    const fixes = {}
    if (rawPage !== null && rawPage !== String(page)) fixes.page = page
    if (rawLimit !== null && rawLimit !== String(limit)) fixes.limit = limit
    if (Object.keys(fixes).length > 0) updateParams(fixes, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, status: 'loading', error: '' }))

    getProducts({ limit, skip: getSkip(page, limit), signal: controller.signal })
      .then((data) => {
        const totalPages = getTotalPages(data.total, limit)

        // ?page=999 → jump to the last real page instead of showing an empty list
        if (page > totalPages) {
          updateParams({ page: totalPages }, { replace: true })
          return
        }

        setState({ status: 'success', products: data.products, total: data.total, error: '' })
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return
        setState({ status: 'error', products: [], total: 0, error: err.message })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, reloadKey])

  function handlePageChange(newPage) {
    updateParams({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLimitChange(newLimit) {
    updateParams({ limit: newLimit, page: 1 }) // page size changed → back to page 1
  }

  const totalPages = getTotalPages(state.total, limit)
  const { start, end } = getRange(page, limit, state.total)
  const showControls = state.status !== 'error' && state.total > 0

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <PageSizeSelect value={limit} onChange={handleLimitChange} />
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

      {showControls && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-600 text-center">
            Showing {start}–{end} of {state.total}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}