import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import GoogleAnalytics from './components/GoogleAnalytics';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Collection from './pages/Collection';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import Returns from './pages/Returns';
import Loyalty from './pages/Loyalty';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Verify from './pages/Verify';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AdvancedSearchBar from './components/AdvancedSearchBar';
import ChatWidget from './components/ChatWidget';
import CompareBar from './components/CompareBar';
import NewsletterPopup from './components/NewsletterPopup';
import CompareContextProvider from './context/CompareContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ErrorBoundary>
          <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <CompareContextProvider>
                <GoogleAnalytics />
                <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
                  <ToastContainer/>
                  <NavBar />
                  <AdvancedSearchBar/>
                  <ChatWidget />
                  <CompareBar />
                  <NewsletterPopup />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:productId" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/place-order" element={<PlaceOrder />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/addresses" element={<Addresses />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/loyalty" element={<Loyalty />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer/>
            </div>
              </CompareContextProvider>
          </GoogleOAuthProvider>
        </GoogleReCaptchaProvider>
      </ErrorBoundary>
    </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
