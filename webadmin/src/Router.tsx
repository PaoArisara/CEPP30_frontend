import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages for performance
const Login = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/DashboardPage'));
const FindCar = React.lazy(() => import('./pages/FindCarPage'));
const FindSlot = React.lazy(() => import('./pages/FindSlotPage'));
const Camera = React.lazy(() => import('./pages/CameraPage'));
const ParkingLog = React.lazy(() => import('./pages/ParkingLogPage'));
const Display = React.lazy(() => import('./pages/DisplayPage'));

// Helper component to handle redirect with URL clearing
const RedirectToLogin = () => {
  // ใช้ replace: true เพื่อลบ URL เก่าออกจาก history
  return <Navigate to="/login" replace={true} />;
};

const Router: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner/></div>}>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RedirectToLogin />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/findSlot" element={<FindSlot />} />
            <Route path="/findCar" element={<FindCar />} />
            <Route path="/equipment" element={<Camera />} />
            <Route path="/history" element={<ParkingLog />} />
            <Route path="/display" element={<Display />} />
          </Route>

          {/* 404 Route - Redirect to login for any undefined path */}
          <Route path="*" element={<RedirectToLogin />} />
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
};

export default Router;