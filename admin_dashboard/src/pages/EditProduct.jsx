import { useParams } from 'react-router-dom'

export default function EditProduct() {
  const { id } = useParams()
  return <h1 className="text-2xl font-bold p-6">Edit Product: {id}</h1>
}