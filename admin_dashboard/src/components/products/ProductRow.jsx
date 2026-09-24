import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/format'

export default function ProductRow({ product }) {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-12 w-12 rounded object-cover bg-gray-100"
        />
      </td>
      <td className="p-3 font-medium">
        <Link to={`/products/${product.id}`} className="hover:underline">
          {product.title}
        </Link>
      </td>
      <td className="p-3 capitalize">{product.category}</td>
      <td className="p-3">{formatPrice(product.price)}</td>
      <td className="p-3">⭐ {product.rating}</td>
      <td className="p-3">{product.stock}</td>
    </tr>
  )
}