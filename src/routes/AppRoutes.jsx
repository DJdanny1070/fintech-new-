import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RoleSelect from "../pages/RoleSelect";
import Dashboard from "../pages/Dashboard";
import Marketplace from "../pages/Marketplace";
import Wallet from "../pages/Wallet";
import BlockchainPage from "../pages/Blockchain";
import Analytics from "../pages/Analytics";
import ProductDetails from "../pages/ProductDetails";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import { ToastProvider } from "../components/common/ToastProvider";

/* Static / informational pages */
import AboutUs from "../pages/AboutUs";
import Contact from "../pages/Contact";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import CookiePolicy from "../pages/CookiePolicy";
import Compliance from "../pages/Compliance";
import Documentation from "../pages/Documentation";
import HelpCentre from "../pages/HelpCentre";
import StatusPage from "../pages/StatusPage";
import AssetTokenization from "../pages/AssetTokenization";
import TokenizationRequest from "../pages/TokenizationRequest";
import DirectConsultancy from "../pages/DirectConsultancy";
import AssetTokenizationRequest from "../pages/AssetTokenizationRequest";
import ConsultancyRequest from "../pages/ConsultancyRequest";

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/choose-role" element={<RoleSelect />} />

          {/* Static / Informational Routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/services/asset-tokenization" element={<AssetTokenization />} />
          <Route path="/tokenization-request" element={<TokenizationRequest />} />
          <Route path="/services/direct-consultancy" element={<DirectConsultancy />} />
          <Route path="/request/asset-tokenization" element={<AssetTokenizationRequest />} />
          <Route path="/consultation-request" element={<ConsultancyRequest />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="blockchain" element={<BlockchainPage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
          </Route>
 
          {/* Public product details route */}
          <Route path="/marketplace/product/:id" element={<ProductDetails />} />
          <Route path="/marketplace/:id" element={<ProductDetails />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;