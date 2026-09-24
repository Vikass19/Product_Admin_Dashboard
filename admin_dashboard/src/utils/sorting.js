export const SORT_FIELDS = ['price', 'rating', 'title']

export const SORT_OPTIONS = [
  { value: '', label: 'Sort: Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-asc', label: 'Rating: Low to High' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'title-desc', label: 'Title: Z to A' },
]

// Turn any URL value into a safe { sort, order }
export function parseSort(searchParams) {
  const sort = searchParams.get('sort')
  if (!SORT_FIELDS.includes(sort)) return { sort: '', order: '' }
  return { sort, order: searchParams.get('order') === 'desc' ? 'desc' : 'asc' }
}