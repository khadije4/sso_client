import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MFAVerify = () => {
  const navigate = useNavigate();
  const { mfaVerify } = useAuth();
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('totp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Retrieve mfa_token from session storage (set by login)
  const mfaToken = sessionStorage.getItem('mfa_token');
  const mfaMethods = JSON.parse(sessionStorage.getItem('mfa_methods') || '[]');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) {
      setError('Code required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await mfaVerify(mfaToken, code, method);
      // navigation is handled inside mfaVerify (to dashboard)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (!mfaToken || mfaMethods.length === 0) {
    return <div className="text-center text-red-600">Session expired. Please log in again.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          {mfaMethods.map((m) => (
            <option key={m} value={m}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        {error && <div className="mt-2 text-red-600">{error}</div>}
      </form>
    </div>
  );
};

export default MFAVerify;