import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Template components
import AdminLayout from './layouts/AdminLayout';
import Loader from './template-components/Loader/Loader';

// Original components
import Login from './components/Login';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Add = lazy(() => import('./pages/Add'));
const List = lazy(() => import('./pages/List'));
const Edit = lazy(() => import('./pages/Edit'));
const Orders = lazy(() => import('./pages/Orders'));
const Stock = lazy(() => import('./pages/Stock'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Returns = lazy(() => import('./pages/Returns'));
const Chat = lazy(() => import('./pages/Chat'));
const Loyalty = lazy(() => import('./pages/Loyalty'));
const QA = lazy(() => import('./pages/QA'));
const AbandonedCarts = lazy(() => import('./pages/AbandonedCarts'));
const RecommendationStats = lazy(() => import('./pages/RecommendationStats'));
const Settings = lazy(() => import('./pages/Settings'));

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
// Removed console.log for production
export const currency = '$';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  if (token === '') {
    return (
      <>
        <ToastContainer />
        <Login setToken={setToken} />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Suspense fallback={<Loader />}>
        <AdminLayout setToken={setToken}>
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/add" element={<Add token={token} />} />
            <Route path="/list" element={<List token={token} />} />
            <Route path="/edit/:id" element={<Edit token={token} />} />
            <Route path="/stock" element={<Stock token={token} />} />
            <Route path="/order" element={<Orders token={token} />} />
            <Route path="/abandoned-carts" element={<AbandonedCarts token={token} />} />
            <Route path="/returns" element={<Returns token={token} />} />
            <Route path="/chat" element={<Chat token={token} />} />
            <Route path="/loyalty" element={<Loyalty token={token} />} />
            <Route path="/qa" element={<QA token={token} />} />
            <Route path="/coupons" element={<Coupons token={token} />} />
            <Route path="/recommendations" element={<RecommendationStats token={token} />} />
            <Route path="/settings" element={<Settings token={token} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AdminLayout>
      </Suspense>
    </>
  );
};

export default App;
