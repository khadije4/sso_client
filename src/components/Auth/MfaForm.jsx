import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const MfaForm = () => {
  const { mfaVerify } = useAuth();
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('');
  const [methods, setMethods] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedMethods = sessionStorage.getItem('mfa_methods');
    if (storedMethods) {
      const parsed = JSON.parse(storedMethods);
      setMethods(parsed);
      setMethod(parsed[0] || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await mfaVerify(code, method);
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  if (methods.length === 0) return <div>Chargement...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Méthode</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
  );
};

export default MfaForm;