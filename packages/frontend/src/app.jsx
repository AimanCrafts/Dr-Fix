import { Routes, Route } from "react-router-dom";
import Home from "./client/jsx/home";
import Login from "./client/jsx/login";
import Signup from "./client/jsx/signup";
import Otp from "./client/jsx/otp";
import Services from "./client/jsx/services";
import ClientDashboard from "./client/jsx/client_dashboard";
import Checkout from "./client/jsx/checkout";
import BookingConfirmed from "./client/jsx/confirmation";
import ProtectedRoute from "./client/jsx/ProtectedRoute";

import AdminLogin from "./admin/jsx/login";
import AdminDashboard from "./admin/jsx/dashboard";
import AdminProtectedRoute from "./admin/jsx/AdminProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/services" element={<Services />} />
      <Route
        path="/client_dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/booking-confirmed" element={<BookingConfirmed />} />

      {/* Admin — separate session from the customer routes above */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
