import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MfaPage = () => {
  const { mfaVerify } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('totp');
  const [methods, setMethods] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedMethods = sessionStorage.getItem('mfa_methods');
    if (storedMethods) {
      const parsed = JSON.parse(storedMethods);
      setMethods(parsed);
      setMethod(parsed[0] || 'totp');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mfaToken = sessionStorage.getItem('mfa_token');
    if (!mfaToken) {
      setError('Session expirée, veuillez vous reconnecter.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await mfaVerify(mfaToken, code, method, false);
      const redirectAfterMfa = sessionStorage.getItem('redirectAfterMfa');
      sessionStorage.removeItem('redirectAfterMfa');
      navigate(redirectAfterMfa || '/client/select');
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Double authentification
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Méthode</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              {methods.map(m => (
                <option key={m} value={m}>
                  {m === 'totp' ? 'Application (TOTP)' : m === 'email' ? 'Email' : 'SMS'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="123456"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MfaPage;