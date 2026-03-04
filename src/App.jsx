import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import CartDrawer from "./components/layout/CartDrawer";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/utils/ScrollToTop";
import PageTransition from "./components/utils/PageTransition";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/MyOrder";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const ComingSoon = ({ page }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-black text-black uppercase tracking-tight">{page}</h2>
      <p className="text-gray-400 mt-2 text-sm">Page coming soon...</p>
    </div>
  </div>
);

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Fixed Header — auth pages pe nahi */}
      {!isAuthPage && (
        <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <div className={`transition-all duration-300 overflow-hidden ${scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}>
            <AnnouncementBar />
          </div>
          <Navbar
            cartCount={totalItems}
            scrolled={scrolled}
            isHome={isHome}
            onCartClick={() => setIsOpen(true)}
          />
        </header>
      )}

      <ScrollToTop />
      <CartDrawer />

      <main className={isHome || isAuthPage ? "" : "pt-24.5"}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/collections/:category" element={<CollectionPage />} />
            <Route path="/collections/:category/:subcategory" element={<CollectionPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<ComingSoon page="Cart" />} />
            <Route path="*" element={<ComingSoon page="404 — Not Found" />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          </Routes>
        </PageTransition>
      </main>

      {!isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}