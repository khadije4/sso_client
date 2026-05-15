import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/Auth/PrivateRoute';
import ClientLayout from './components/Layout/ClientLayout';
import ClientProfilePage from './pages/ClientProfilePage';
import ClientAppsPage from './pages/ClientAppsPage';
import ClientTeamPage from './pages/ClientTeampage';
import ClientStatsPage from './pages/ClientStatsPage';
import ClientSubscriptionPage from './pages/ClientSubscriptionPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientSelectPage from './pages/ClientSelectPage';
import ClientSignupPage from './pages/ClientSignupPage';
import ClientVerifyEmailPage from './pages/ClientVerifyEmailPage';
import ClientVerifyIdentityPage from './pages/ClientVerifyIdentityPage';
import ClientCreateCompanyPage from './pages/ClientCreateCompanyPage';
import MfaPage from './pages/MfaPage';
import LandingPage from './pages/LandingPage';

// Client portal only. End-user flows (mobile signup, biometric, MFA enrollment,
// per-user dashboard/settings) live entirely in the mobile app now.
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Onboarding funnel: signup -> verify email -> verify identity -> create company */}
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
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="apps" element={<ClientAppsPage />} />
        <Route path="team" element={<ClientTeamPage />} />
        <Route path="stats" element={<ClientStatsPage />} />
        <Route path="subscription" element={<ClientSubscriptionPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/client/login" replace />} />
    </Routes>
  );
}

export default App;
