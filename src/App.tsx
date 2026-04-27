import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { Layout } from './components/Layout';
import { UserLayout } from './components/UserLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Passengers } from './pages/Passengers';
import { BaggagePage } from './pages/Baggage';
import { TrackingPage } from './pages/Tracking';
import { Claims } from './pages/Claims';
import { UserTrackingPage } from './pages/user/UserTrackingPage';
import { UserClaimsPage } from './pages/user/UserClaimsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function getAuth() {
  const token = localStorage.getItem('token');
  const str = localStorage.getItem('user');
  const user = str ? JSON.parse(str) : null;
  return { token, role: user?.role ?? null };
}

function AdminRoute() {
  const { token, role } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'USER') return <Navigate to="/user/tracking" replace />;
  return <Layout><Outlet /></Layout>;
}

function UserRoute() {
  const { token, role } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'USER') return <Navigate to="/" replace />;
  return <UserLayout><Outlet /></UserLayout>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin / Staff */}
          <Route element={<AdminRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/passengers" element={<Passengers />} />
            <Route path="/baggage" element={<BaggagePage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/claims" element={<Claims />} />
          </Route>

          {/* User */}
          <Route element={<UserRoute />}>
            <Route path="/user/tracking" element={<UserTrackingPage />} />
            <Route path="/user/claims" element={<UserClaimsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
