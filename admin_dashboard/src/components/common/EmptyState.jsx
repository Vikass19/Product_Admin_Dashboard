export default function EmptyState({ message = 'No products found.' }) {
  return <p className="py-16 text-center text-gray-500">{message}</p>
}