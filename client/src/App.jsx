import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Services from './pages/Services'
import BookService from './pages/BookService'
import Overview from './pages/dashboard/Overview'
import Bookings from './pages/dashboard/Bookings'
import ComingSoon from './pages/dashboard/ComingSoon'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book/:id" element={<BookService />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="messages" element={<ComingSoon title="Messages" />} />
          <Route path="payments" element={<ComingSoon title="Payments" />} />
          <Route path="reviews" element={<ComingSoon title="Reviews" />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
