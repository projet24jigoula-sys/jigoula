import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import MerchantDashboard from './pages/MerchantDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ClientPage from './pages/ClientPage';
import ScanPage from './pages/ScanPage';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: AuthPage },
      { path: 'scan/:qrToken', Component: ScanPage },
      {
        path: 'merchant',
        element: <ProtectedRoute allowedRoles={['MERCHANT']}><MerchantDashboard /></ProtectedRoute>
      },
      {
        path: 'partner',
        element: <ProtectedRoute allowedRoles={['ADMIN']}><PartnerDashboard /></ProtectedRoute>
      },
      {
        path: 'client/dashboard',
        element: <ProtectedRoute allowedRoles={['CLIENT']}><ClientDashboard /></ProtectedRoute>
      },
      {
        path: 'client/:shopId',
        element: <ProtectedRoute allowedRoles={['CLIENT']}><ClientPage /></ProtectedRoute>
      },
    ],
  },
]);
