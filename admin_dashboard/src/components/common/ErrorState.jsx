export default function ErrorState({ message = 'Unable to load products.', onRetry }) {
  return (
    <div role="alert" className="py-16 text-center">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="border rounded px-4 py-2 bg-white hover:bg-gray-100"
        >
          Retry
        </button>
      )}
    </div>
  )
}