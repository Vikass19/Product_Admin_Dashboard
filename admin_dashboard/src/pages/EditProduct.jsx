import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getProductById,
  updateProduct,
} from '../services/productService'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    stock: '',
    description: '',
  })

  const [status, setStatus] = useState('loading')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function fetchProduct() {
      try {
        setStatus('loading')
        setApiError('')

        const product = await getProductById(id, controller.signal)

        if (ignore) return

        setForm({
          title: product.title || '',
          price: product.price ?? '',
          category: product.category || '',
          stock: product.stock ?? '',
          description: product.description || '',
        })

        setStatus('success')
      } catch (error) {
        if (
          ignore ||
          error.name === 'CanceledError' ||
          error.name === 'AbortError'
        ) {
          return
        }

        if (error.response?.status === 404) {
          setApiError('Product Not Found')
        } else {
          setApiError('Failed to load product')
        }

        setStatus('error')
      }
    }

    fetchProduct()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  function validate() {
    const newErrors = {}

    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (form.price === '') {
      newErrors.price = 'Price is required'
    } else if (Number(form.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (!form.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (form.stock === '') {
      newErrors.stock = 'Stock is required'
    } else if (Number(form.stock) < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    }

    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (submitting) return

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setSubmitting(true)
      setApiError('')

      const payload = {
        title: form.title.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        stock: Number(form.stock),
        description: form.description.trim(),
      }

      await updateProduct(id, payload)

      navigate(`/products/${id}`)
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          'Failed to update product. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <Loader />
  }

  if (status === 'error') {
    if (apiError === 'Product Not Found') {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Product Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            The product you are trying to edit does not exist.
          </p>

          <button
            onClick={() => navigate('/products')}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      )
    }

    return (
      <ErrorState
        message={apiError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate(`/products/${id}`)}
        disabled={submitting}
        className="mb-6 rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
      >
        ← Back to Product
      </button>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the product information.
        </p>

        {apiError && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Price
            </label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Stock
            </label>

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stock}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/products/${id}`)}
              disabled={submitting}
              className="rounded-lg border px-5 py-2.5 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}