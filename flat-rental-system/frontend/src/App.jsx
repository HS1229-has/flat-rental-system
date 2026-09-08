import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import PublicRoute from './components/layout/PublicRoute';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Properties from './pages/properties/Properties';
import PropertyDetails from './pages/properties/PropertyDetails';
import TenantDashboard from './pages/tenant/TenantDashboard';
import BookProperty from './pages/tenant/BookProperty';
import Payment from './pages/tenant/Payment';
import TenantVerificationForm from './pages/tenant/TenantVerificationForm';
import TenantApplicationForm from './pages/tenant/TenantApplicationForm';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddProperty from './pages/owner/AddProperty';
import EditProperty from './pages/owner/EditProperty';
import AdminDashboard from './pages/admin/AdminDashboard';
import Footer from './components/layout/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              
              {/* Auth Routes (only accessible if NOT logged in) */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Tenant Routes */}
              <Route element={<ProtectedRoute allowedRoles={['TENANT']} />}>
                <Route path="/tenant/dashboard" element={<TenantDashboard />} />
                <Route path="/tenant/book/:id" element={<BookProperty />} />
                <Route path="/tenant/apply" element={<TenantApplicationForm />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/:bookingId" element={<Payment />} />
                <Route path="/tenant/verification/:bookingId" element={<TenantVerificationForm />} />
              </Route>

              {/* Owner Routes */}
              <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/property/add" element={<AddProperty />} />
                <Route path="/owner/property/edit/:id" element={<EditProperty />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
