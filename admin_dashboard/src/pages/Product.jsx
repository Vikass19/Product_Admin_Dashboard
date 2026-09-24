import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, searchProducts } from '../services/productService'
import { getRange, getSkip, getTotalPages, parsePagination } from '../utils/pagination'
import useDebounce from '../hooks/useDebounce'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import PageSizeSelect from '../components/common/PageSizeSelect'
import ProductTable from '../components/products/ProductTable'
import ProductGrid from '../components/products/ProductGrid'

const SEARCH_DELAY = 400

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, limit } = parsePagination(searchParams)
  const search = (searchParams.get('search') || '').trim()

  const [searchInput, setSearchInput] = useState(search)
  const debouncedInput = useDebounce(searchInput, SEARCH_DELAY)

  const [state, setState] = useState({ status: 'loading', products: [], total: 0, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  // Empty values remove the param from the URL
  function updateParams(changes, { replace = false } = {}) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(changes).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) next.delete(key)
          else next.set(key, String(value))
        })
        return next
      },
      { replace }
    )
  }

  // Debounced input → URL, and a new search always goes back to page 1
  useEffect(() => {
    const next = debouncedInput.trim()
    if (next !== search) updateParams({ search: next, page: 1 }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput])

  // URL → input, only for outside changes (Back button, edited URL).
  // Our own debounced update already matches, so typing is never overwritten.
  useEffect(() => {
    if (search !== debouncedInput.trim()) setSearchInput(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Rewrite invalid page/limit values
  useEffect(() => {
    const rawPage = searchParams.get('page')
    const rawLimit = searchParams.get('limit')
    const fixes = {}
    if (rawPage !== null && rawPage !== String(page)) fixes.page = page
    if (rawLimit !== null && rawLimit !== String(limit)) fixes.limit = limit
    if (Object.keys(fixes).length > 0) updateParams(fixes, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Fetch products
  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, status: 'loading', error: '' }))

    const skip = getSkip(page, limit)
    const request = search
      ? searchProducts({ q: search, limit, skip, signal: controller.signal })
      : getProducts({ limit, skip, signal: controller.signal })

    request
      .then((data) => {
        const totalPages = getTotalPages(data.total, limit)
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
  }, [page, limit, search, reloadKey])

  function handlePageChange(newPage) {
    updateParams({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLimitChange(newLimit) {
    updateParams({ limit: newLimit, page: 1 })
  }

  const totalPages = getTotalPages(state.total, limit)
  const { start, end } = getRange(page, limit, state.total)
  const showControls = state.status !== 'error' && state.total > 0

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full sm:w-64 border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <PageSizeSelect value={limit} onChange={handleLimitChange} />
        </div>
      </div>

      {state.status === 'loading' && <Loader />}

      {state.status === 'error' && (
        <ErrorState message={state.error} onRetry={() => setReloadKey((k) => k + 1)} />
      )}

      {state.status === 'success' && state.products.length === 0 && (
        <EmptyState message={search ? `No products found for "${search}".` : 'No products found.'} />
      )}

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