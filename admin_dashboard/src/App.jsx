import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Product from './pages/Product'
import ProductDetails from './pages/ProductDetails'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'

import DashboardLayout from './components/layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/products" element={<Product />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
        </Route>
      </Route>

      <Route path="*" element={<h1 className="p-6 text-xl">404 - Page not found</h1>} />
    </Routes>
  )
}