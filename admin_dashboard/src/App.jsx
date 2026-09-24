import { Routes, Route, Navigate } from 'react-router-dom'
import Products from './pages/Product'
import Login from './pages/Login'
import AddProduct from './pages/AddProduct'
import ProductDetails from './pages/ProductDetails'
import EditProduct from './pages/EditProduct'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/new" element={<AddProduct />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/products/:id/edit" element={<EditProduct />} />
      <Route path="*" element={<h1 className="p-6 text-xl">404 - Page not found</h1>} />
    </Routes>
  )
}