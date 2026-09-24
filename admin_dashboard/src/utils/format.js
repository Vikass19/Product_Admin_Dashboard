const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatPrice(value) {
  return usd.format(Number(value) || 0)
}