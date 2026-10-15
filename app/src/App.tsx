import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { StaffLayout, VisitorLayout } from '@/app/layouts'
import { ComingSoonPage } from '@/features/ComingSoonPage'
import { SalesPage } from '@/features/sales/SalesPage'
import { CartProvider } from '@/features/sell/CartProvider'
import { CheckoutPage } from '@/features/sell/CheckoutPage'
import { SellPage } from '@/features/sell/SellPage'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="sell" replace />} />
            <Route path="sell" element={<SellPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="stock" element={<ComingSoonPage titleKey="stock.title" />} />
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
