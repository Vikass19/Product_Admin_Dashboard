import { useParams } from 'react-router-dom'

export default function ProductDetails() {
  const { id } = useParams()
  return <h1 className="text-2xl font-bold p-6">Product Details: {id}</h1>
}