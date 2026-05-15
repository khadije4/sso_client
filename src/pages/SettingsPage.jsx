import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import TOTPActivate from '../components/MFA/TOTPActivate';
import BiometricEnroll from '../components/Biometric/BiometricEnroll';

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
  const [biometricEnabled, setBiometricEnabled] = useState(user?.biometric_enabled || false);
  const [showMfaActivate, setShowMfaActivate] = useState(false);
  const [showBiometricEnroll, setShowBiometricEnroll] = useState(false);

  // Refresh user info after enabling/disabling
  const loadUser = async () => {
    const res = await api.get('/user/me/');
    setMfaEnabled(res.data.mfa_enabled);
    setBiometricEnabled(res.data.biometric_enabled);
  };

  const handleDisableMfa = async () => {
    const password = prompt('Enter your password to disable MFA:');
    if (!password) return;
    try {
      await api.post('/mfa/totp/disable/', { password });
      alert('MFA disabled successfully');
      loadUser();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to disable MFA');
    }
  };

  const handleDisableBiometric = async () => {
    if (window.confirm('Are you sure you want to delete your biometric profile?')) {
      try {
        await api.delete('/biometric/delete/');
        alert('Biometric profile deleted');
        loadUser();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete biometric profile');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Security Settings</h1>

      {/* MFA Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Multi-Factor Authentication (TOTP)</h2>
        {!mfaEnabled ? (
          <>
            <p className="text-gray-600 mb-3">Protect your account with an authenticator app (Google Authenticator, Authy, etc.).</p>
            {!showMfaActivate ? (
              <button
                onClick={() => setShowMfaActivate(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Enable MFA
              </button>
            ) : (
              <TOTPActivate onSuccess={() => { setShowMfaActivate(false); loadUser(); }} />
            )}
          </>
        ) : (
          <div>
            <p className="text-green-600 mb-3">✅ MFA is enabled</p>
            <button
              onClick={handleDisableMfa}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Disable MFA
            </button>
          </div>
        )}
      </div>

      {/* Biometric Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Face Recognition (Biometric)</h2>
        {!biometricEnabled ? (
          <>
            <p className="text-gray-600 mb-3">Enroll your face to log in using facial recognition.</p>
            {!showBiometricEnroll ? (
              <button
                onClick={() => setShowBiometricEnroll(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Enroll Face
              </button>
            ) : (
              <BiometricEnroll onSuccess={() => { setShowBiometricEnroll(false); loadUser(); }} />
            )}
          </>
        ) : (
          <div>
            <p className="text-green-600 mb-3">✅ Biometric is enabled</p>
            <button
              onClick={handleDisableBiometric}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Biometric Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;