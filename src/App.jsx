import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/Auth/PrivateRoute';
import ClientLayout from './components/Layout/ClientLayout';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientServicesPage from './pages/ClientServicesPage';
import ClientStatsPage from './pages/ClientStatsPage';
import ClientSettingsPage from './pages/ClientSettingsPage';
import ClientAppsPage from './pages/ClientAppsPage';
import ClientTeamPage from './pages/ClientTeampage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientSelectPage from './pages/ClientSelectPage';
import ClientSignupPage from './pages/ClientSignupPage';
import ClientVerifyEmailPage from './pages/ClientVerifyEmailPage';
import ClientVerifyIdentityPage from './pages/ClientVerifyIdentityPage';
import ClientCreateCompanyPage from './pages/ClientCreateCompanyPage';
import MfaPage from './pages/MfaPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Onboarding funnel */}
      <Route path="/client/login" element={<ClientLoginPage />} />
      <Route path="/client/signup" element={<ClientSignupPage />} />
      <Route path="/client/verify-email" element={<ClientVerifyEmailPage />} />
      <Route path="/client/verify-identity" element={<PrivateRoute><ClientVerifyIdentityPage /></PrivateRoute>} />
      <Route path="/client/create-company" element={<PrivateRoute><ClientCreateCompanyPage /></PrivateRoute>} />
      <Route path="/client/select" element={<PrivateRoute><ClientSelectPage /></PrivateRoute>} />
      <Route path="/mfa" element={<MfaPage />} />

      {/* Authenticated client workspace */}
      <Route
        path="/client/:clientId"
        element={
          <PrivateRoute>
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="services" element={<ClientServicesPage />} />
        <Route path="analytics" element={<ClientStatsPage />} />
        <Route path="settings" element={<ClientSettingsPage />} />
        {/* Legacy routes kept for compatibility */}
        <Route path="apps" element={<ClientAppsPage />} />
        <Route path="team" element={<ClientTeamPage />} />
        <Route path="stats" element={<Navigate to="analytics" replace />} />
        <Route path="profile" element={<Navigate to="settings" replace />} />
        <Route path="subscription" element={<Navigate to="settings" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/client/login" replace />} />
    </Routes>
  );
}

export default App;
