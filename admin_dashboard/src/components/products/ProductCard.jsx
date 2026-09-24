import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/format'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="block bg-white border rounded-lg overflow-hidden hover:shadow"
    >
      <img
        src={product.thumbnail}
        alt={product.title}
        loading="lazy"
        className="w-full h-40 object-contain bg-gray-100"
      />
      <div className="p-3 space-y-1">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        <p className="font-medium">{formatPrice(product.price)}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <span>⭐ {product.rating}</span>
          <span>Stock: {product.stock}</span>
        </div>
      </div>
    </Link>
  )
}