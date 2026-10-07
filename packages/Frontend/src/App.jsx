import { Routes, Route } from "react-router-dom";

import Home from "./client/jsx/home";
import Login from "./client/jsx/login";
import Signup from "./client/jsx/signup";
import Otp from "./client/jsx/otp";
import Services from "./client/jsx/services";
import ClientDashboard from "./client/jsx/client_dashboard";
import MyBookings from "./client/jsx/my-bookings";
import Addresses from "./client/jsx/addresses";
import Checkout from "./client/jsx/checkout";
import BookingConfirmed from "./client/jsx/confirmation";
import BookingTracking from "./client/jsx/booking-tracking";
import Profile from "./client/jsx/profile";
import Settings from "./client/jsx/settings";
import ProtectedRoute from "./client/jsx/ProtectedRoute";

import AdminLogin from "./admin/jsx/login";
import AdminDashboard from "./admin/jsx/dashboard";
import AdminProtectedRoute from "./admin/jsx/AdminProtectedRoute";
import AdminApprovals from "./admin/jsx/approvals";

import TechnicianLogin from "./technician/jsx/login";
import TechnicianDashboard from "./technician/jsx/dashboard";
import TechnicianJobRequests from "./technician/jsx/job-requests";
import TechnicianEarnings from "./technician/jsx/earnings";
import TechnicianSchedule from "./technician/jsx/schedule";
import TechnicianProfile from "./technician/jsx/profile";
import TechnicianSettings from "./technician/jsx/settings";
import TechnicianReviews from "./technician/jsx/reviews";
import TechnicianMyBookings from "./technician/jsx/my-bookings";
import ApplicationUnderReview from "./technician/jsx/application";
import TechnicianProtectedRoute from "./technician/jsx/TechnicianProtectedRoute";

import PageNotFound from "./component/jsx/page-not-found";
import AboutUs from "./component/jsx/about-us";
import HowItWorks from "./component/jsx/how-it-works";
import ContactUs from "./component/jsx/contact-us";
import AboutDrFix from "./component/jsx/about-dr-fix";
import FAQ from "./component/jsx/faq";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />

      <Route path="/services" element={<Services />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/about-dr-fix" element={<AboutDrFix />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<FAQ />} />

      {/* ================= CUSTOMER ================= */}

      <Route
        path="/client_dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <Addresses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-confirmed"
        element={
          <ProtectedRoute>
            <BookingConfirmed />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-tracking"
        element={
          <ProtectedRoute>
            <BookingTracking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/approvals"
        element={
          <AdminProtectedRoute>
            <AdminApprovals />
          </AdminProtectedRoute>
        }
      />

      {/* ================= TECHNICIAN ================= */}

      <Route path="/technician/login" element={<TechnicianLogin />} />

      <Route
        path="/technician/dashboard"
        element={
          <TechnicianProtectedRoute>
            <TechnicianDashboard />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/job-requests"
        element={
          <TechnicianProtectedRoute>
            <TechnicianJobRequests />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/earnings"
        element={
          <TechnicianProtectedRoute>
            <TechnicianEarnings />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/schedule"
        element={
          <TechnicianProtectedRoute>
            <TechnicianSchedule />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/profile"
        element={
          <TechnicianProtectedRoute>
            <TechnicianProfile />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/reviews"
        element={
          <TechnicianProtectedRoute>
            <TechnicianReviews />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/settings"
        element={
          <TechnicianProtectedRoute>
            <TechnicianSettings />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/my-bookings"
        element={
          <TechnicianProtectedRoute>
            <TechnicianMyBookings />
          </TechnicianProtectedRoute>
        }
      />

      <Route
        path="/technician/application-under-review"
        element={<ApplicationUnderReview />}
      />

      {/* ================= 404 ================= */}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
