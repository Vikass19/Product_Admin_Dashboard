import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductById } from '../services/productService'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function fetchProduct() {
      try {
        setStatus('loading')
        setError('')
        setProduct(null)

        const data = await getProductById(id, controller.signal)

        if (ignore) return

        setProduct(data)
        setStatus('success')
      } catch (err) {
        if (ignore || err.name === 'CanceledError' || err.name === 'AbortError') {
          return
        }

        if (err.response?.status === 404) {
          setError('Product Not Found')
        } else {
          setError('Failed to load product')
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

  // Loading state
  if (status === 'loading') {
    return <Loader />
  }

  // Product not found
  if (status === 'error' && error === 'Product Not Found') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Product Not Found
        </h1>

        <p className="mt-2 text-gray-500">
          The product you are looking for does not exist.
        </p>

      {/* Action buttons */}
<div className="mb-6 flex flex-wrap gap-3">
  <button
    onClick={() => navigate('/products')}
    className="rounded-lg border px-4 py-2 hover:bg-gray-100"
  >
    ← Back to Products
  </button>

  <button
    onClick={() => navigate(`/products/${product.id}/edit`)}
    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
  >
    Edit Product
  </button>
</div>
      </div>
    )
  }

  // Other API errors
  if (status === 'error') {
    return (
      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Extra safety check
  if (!product) {
    return null
  }

  return (
    <div className="p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/products')}
        className="mb-6 rounded-lg border px-4 py-2 hover:bg-gray-100"
      >
        ← Back to Products
      </button>

      {/* Product main section */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 md:h-96">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Additional images */}
          {product.images?.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  loading="lazy"
                  className="h-20 w-full rounded-lg border bg-gray-50 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div>
          <p className="text-sm font-medium uppercase text-blue-600">
            {product.category}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {product.title}
          </h1>

          <p className="mt-5 text-3xl font-bold text-gray-900">
            ${product.price}
          </p>

          <div className="mt-5 flex flex-wrap gap-6 text-sm text-gray-600">
            <span>
              <strong>Rating:</strong> ⭐ {product.rating}
            </span>

            <span>
              <strong>Stock:</strong> {product.stock}
            </span>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">
              Description
            </h2>

            <p className="mt-2 leading-7 text-gray-600">
              {product.description}
            </p>
          </div>

          {/* Brand */}
          {product.brand && (
            <p className="mt-4 text-sm">
              <strong>Brand:</strong> {product.brand}
            </p>
          )}

          {/* Discount */}
          {product.discountPercentage && (
            <p className="mt-2 text-sm text-green-600">
              {product.discountPercentage}% discount
            </p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">
          Reviews
        </h2>

        {product.reviews?.length > 0 ? (
          <div className="mt-4 space-y-4">
            {product.reviews.map((review, index) => (
              <div
                key={index}
                className="rounded-lg border bg-white p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold">
                    {review.reviewerName}
                  </h3>

                  <span>
                    ⭐ {review.rating}
                  </span>
                </div>

                <p className="mt-2 text-gray-600">
                  {review.comment}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {review.date}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">
            No reviews available.
          </p>
        )}
      </section>
    </div>
  )
}