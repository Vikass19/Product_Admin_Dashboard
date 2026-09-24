import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../services/productService'

export default function AddProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    stock: '',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

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

      const product = await createProduct(payload)

      navigate(`/products/${product.id}`)
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          'Failed to create product. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate('/products')}
        className="mb-6 rounded-lg border px-4 py-2 hover:bg-gray-100"
      >
        ← Back to Products
      </button>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Add Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new product.
        </p>

        {apiError && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product title"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* Price */}
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
              placeholder="Enter price"
            />

            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category"
            />

            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          {/* Stock */}
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
              placeholder="Enter stock"
            />

            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stock}
              </p>
            )}
          </div>

          {/* Description */}
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
              placeholder="Enter product description"
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/products')}
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
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}