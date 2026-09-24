import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
} from '../services/productService'
import { getRange, getSkip, getTotalPages, parsePagination } from '../utils/pagination'
import { parseSort } from '../utils/sorting'
import useDebounce from '../hooks/useDebounce'
import useCategories from '../hooks/useCategories'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import ProductFilters from '../components/products/ProductFilters'
import ProductTable from '../components/products/ProductTable'
import ProductGrid from '../components/products/ProductGrid'

const SEARCH_DELAY = 400

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, limit } = parsePagination(searchParams)
  const { sort, order } = parseSort(searchParams)
  const search = (searchParams.get('search') || '').trim()
  const rawCategory = searchParams.get('category') || ''

  // Search wins over category (they are mutually exclusive)
  const category = search ? '' : rawCategory

  const { categories, status: categoriesStatus } = useCategories()

  const [searchInput, setSearchInput] = useState(search)
  const debouncedInput = useDebounce(searchInput, SEARCH_DELAY)

  const [state, setState] = useState({
    status: 'loading',
    products: [],
    total: 0,
    error: '',
  })

  const [reloadKey, setReloadKey] = useState(0)

  // Empty values remove the param from the URL
  function updateParams(changes, { replace = false } = {}) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)

        Object.entries(changes).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        })

        return next
      },
      { replace }
    )
  }

  // Debounced input → URL
  useEffect(() => {
    const next = debouncedInput.trim()

    if (next !== search) {
      updateParams(
        {
          search: next,
          page: 1,
          ...(next ? { category: '' } : {}),
        },
        { replace: true }
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput])

  // URL → input
  useEffect(() => {
    if (search !== debouncedInput.trim()) {
      setSearchInput(search)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Rewrite invalid page / limit / sort / order / conflicting category
  useEffect(() => {
    const rawPage = searchParams.get('page')
    const rawLimit = searchParams.get('limit')
    const rawSort = searchParams.get('sort')
    const rawOrder = searchParams.get('order')

    const fixes = {}

    if (rawPage !== null && rawPage !== String(page)) {
      fixes.page = page
    }

    if (rawLimit !== null && rawLimit !== String(limit)) {
      fixes.limit = limit
    }

    if (rawSort !== null && rawSort !== sort) {
      fixes.sort = sort
    }

    if (!sort && rawOrder !== null) {
      fixes.order = ''
    }

    if (sort && rawOrder !== null && rawOrder !== order) {
      fixes.order = order
    }

    if (search && rawCategory) {
      fixes.category = ''
    }

    if (Object.keys(fixes).length > 0) {
      updateParams(fixes, { replace: true })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Remove unknown category
  useEffect(() => {
    if (categoriesStatus !== 'success' || !rawCategory) return

    if (!categories.some((c) => c.slug === rawCategory)) {
      updateParams(
        {
          category: '',
          page: 1,
        },
        { replace: true }
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesStatus, rawCategory])

  // Fetch products
  useEffect(() => {
    if (category && categoriesStatus === 'loading') return

    const controller = new AbortController()
    let ignore = false

    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: '',
    }))

    const common = {
      limit,
      skip: getSkip(page, limit),
      sortBy: sort || undefined,
      order: sort ? order : undefined,
      signal: controller.signal,
    }

    let request

    if (search) {
      request = searchProducts({
        q: search,
        ...common,
      })
    } else if (category) {
      request = getProductsByCategory({
        category,
        ...common,
      })
    } else {
      request = getProducts(common)
    }

    request
      .then((data) => {
        if (ignore) return

        const totalPages = getTotalPages(data.total, limit)

        if (page > totalPages) {
          updateParams(
            {
              page: totalPages,
            },
            { replace: true }
          )

          return
        }

        setState({
          status: 'success',
          products: data.products,
          total: data.total,
          error: '',
        })
      })
      .catch((err) => {
        if (ignore || err.name === 'CanceledError') return

        setState({
          status: 'error',
          products: [],
          total: 0,
          error: err.message,
        })
      })

    return () => {
      ignore = true
      controller.abort()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    search,
    category,
    sort,
    order,
    categoriesStatus,
    reloadKey,
  ])

  function handlePageChange(newPage) {
    updateParams({
      page: newPage,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleLimitChange(newLimit) {
    updateParams({
      limit: newLimit,
      page: 1,
    })
  }

  // Picking a category clears the search
  function handleCategoryChange(value) {
    updateParams({
      category: value,
      search: '',
      page: 1,
    })

    setSearchInput('')
  }

  function handleSortChange(value) {
    if (!value) {
      updateParams({
        sort: '',
        order: '',
        page: 1,
      })
    } else {
      const [field, dir] = value.split('-')

      updateParams({
        sort: field,
        order: dir,
        page: 1,
      })
    }
  }

  const totalPages = getTotalPages(state.total, limit)
  const { start, end } = getRange(page, limit, state.total)

  const showControls =
    state.status !== 'error' && state.total > 0

  let emptyMessage = 'No products found.'

  if (search) {
    emptyMessage = `No products found for "${search}".`
  } else if (category) {
    emptyMessage = 'No products in this category.'
  }

  return (
    <div className="p-4">
      {/* Page heading + Add Product */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Products
        </h1>

        <Link
          to="/products/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      <ProductFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        categories={categories}
        categoriesStatus={categoriesStatus}
        category={category}
        onCategoryChange={handleCategoryChange}
        sortValue={sort ? `${sort}-${order}` : ''}
        onSortChange={handleSortChange}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      {state.status === 'loading' && <Loader />}

      {state.status === 'error' && (
        <ErrorState
          message={state.error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {state.status === 'success' &&
        state.products.length === 0 && (
          <EmptyState message={emptyMessage} />
        )}

      {state.status === 'success' &&
        state.products.length > 0 && (
          <>
            <ProductTable products={state.products} />
            <ProductGrid products={state.products} />
          </>
        )}

      {showControls && (
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-gray-600">
            Showing {start}–{end} of {state.total}
          </p>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}