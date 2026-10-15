import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { StaffLayout, VisitorLayout } from '@/app/layouts'
import { ComingSoonPage } from '@/features/ComingSoonPage'
import { SellPage } from '@/features/sell/SellPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="sell" replace />} />
          <Route path="sell" element={<SellPage />} />
          <Route path="stock" element={<ComingSoonPage titleKey="stock.title" />} />
          <Route path="sales" element={<ComingSoonPage titleKey="sales.title" />} />
          <Route path="summary" element={<ComingSoonPage titleKey="summary.title" />} />
        </Route>
        <Route path="/visit" element={<VisitorLayout />}>
          <Route index element={<ComingSoonPage titleKey="catalog.title" />} />
          <Route path="stamps" element={<ComingSoonPage titleKey="stamps.title" />} />
        </Route>
        <Route path="*" element={<Navigate to="/staff/sell" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
