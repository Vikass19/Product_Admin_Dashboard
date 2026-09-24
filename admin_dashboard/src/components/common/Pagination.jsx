import { getPageNumbers } from '../../utils/pagination'

const btn =
  'min-w-9 h-9 px-3 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const items = getPageNumbers(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
      <button className={btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>

      {items.map((item, i) =>
        item === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={
              item === page
                ? 'min-w-9 h-9 px-3 border rounded text-sm bg-blue-600 text-white border-blue-600'
                : btn
            }
          >
            {item}
          </button>
        )
      )}

      <button
        className={btn}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}