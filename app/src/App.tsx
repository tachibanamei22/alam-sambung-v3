import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { StaffLayout, VisitorLayout } from '@/app/layouts'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { SalesPage } from '@/features/sales/SalesPage'
import { CartProvider } from '@/features/sell/CartProvider'
import { CheckoutPage } from '@/features/sell/CheckoutPage'
import { SellPage } from '@/features/sell/SellPage'
import { StampClaimPage } from '@/features/stamps/StampClaimPage'
import { StampCodesPage } from '@/features/stamps/StampCodesPage'
import { StampsPage } from '@/features/stamps/StampsPage'
import { ProductFormPage } from '@/features/stock/ProductFormPage'
import { StockPage } from '@/features/stock/StockPage'
import { SummaryPage } from '@/features/summary/SummaryPage'

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
            <Route path="summary" element={<SummaryPage />} />
            <Route path="stamp-codes" element={<StampCodesPage />} />
          </Route>
          <Route path="/visit" element={<VisitorLayout />}>
            <Route index element={<CatalogPage />} />
            <Route path="stamps" element={<StampsPage />} />
            <Route path="stamp/:token" element={<StampClaimPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/staff/sell" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
