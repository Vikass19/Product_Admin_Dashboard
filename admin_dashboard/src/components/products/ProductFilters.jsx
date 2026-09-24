import PageSizeSelect from '../common/PageSizeSelect'
import { SORT_OPTIONS } from '../../utils/sorting'

const selectClass = 'border rounded px-2 py-2 bg-white text-sm disabled:opacity-60'

export default function ProductFilters({
  searchInput,
  onSearchChange,
  categories,
  categoriesStatus,
  category,
  onCategoryChange,
  sortValue,
  onSortChange,
  limit,
  onLimitChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <input
        type="search"
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full sm:w-64 border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        disabled={categoriesStatus !== 'success'}
        aria-label="Filter by category"
        className={`${selectClass} capitalize`}
      >
        <option value="">
          {categoriesStatus === 'error' ? 'Categories unavailable' : 'All categories'}
        </option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort products"
        className={selectClass}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <PageSizeSelect value={limit} onChange={onLimitChange} />
    </div>
  )
}