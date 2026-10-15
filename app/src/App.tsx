import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { StaffLayout, VisitorLayout } from '@/app/layouts'
import { ComingSoonPage } from '@/features/ComingSoonPage'
import { SalesPage } from '@/features/sales/SalesPage'
import { CartProvider } from '@/features/sell/CartProvider'
import { CheckoutPage } from '@/features/sell/CheckoutPage'
import { SellPage } from '@/features/sell/SellPage'
import { ProductFormPage } from '@/features/stock/ProductFormPage'
import { StockPage } from '@/features/stock/StockPage'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="sell" replace />} />
            <Route path="sell" element={<SellPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="stock/new" element={<ProductFormPage />} />
            <Route path="stock/:id" element={<ProductFormPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="summary" element={<ComingSoonPage titleKey="summary.title" />} />
          </Route>
          <Route path="/visit" element={<VisitorLayout />}>
            <Route index element={<ComingSoonPage titleKey="catalog.title" />} />
            <Route path="stamps" element={<ComingSoonPage titleKey="stamps.title" />} />
          </Route>
          <Route path="*" element={<Navigate to="/staff/sell" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
