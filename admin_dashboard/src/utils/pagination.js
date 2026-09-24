export const PAGE_SIZES = [10, 20, 50]
export const DEFAULT_LIMIT = 10

// Turn any URL value into a safe { page, limit }
export function parsePagination(searchParams) {
  const pageNum = Number(searchParams.get('page'))
  const limitNum = Number(searchParams.get('limit'))

  return {
    page: Number.isInteger(pageNum) && pageNum >= 1 ? pageNum : 1,
    limit: PAGE_SIZES.includes(limitNum) ? limitNum : DEFAULT_LIMIT,
  }
}

export function getTotalPages(total, limit) {
  return Math.max(1, Math.ceil(total / limit))
}

// skip = (page - 1) * limit
export function getSkip(page, limit) {
  return (page - 1) * limit
}

export function getRange(page, limit, total) {
  if (total === 0) return { start: 0, end: 0 }
  return {
    start: (page - 1) * limit + 1,
    end: Math.min(page * limit, total),
  }
}

// Example: [1, '...', 4, 5, 6, '...', 20]
export function getPageNumbers(page, totalPages, siblings = 1) {
  const pages = new Set([1, totalPages])
  for (let i = page - siblings; i <= page + siblings; i++) {
    if (i > 1 && i < totalPages) pages.add(i)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result = []

  sorted.forEach((p, i) => {
    if (i > 0) {
      const prev = sorted[i - 1]
      if (p - prev === 2) result.push(prev + 1) // fill a single-page gap
      else if (p - prev > 2) result.push('...')
    }
    result.push(p)
  })

  return result
}