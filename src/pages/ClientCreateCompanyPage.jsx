import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getIdentityStatus } from '../api/identity';

const ClientCreateCompanyPage = () => {
  const navigate = useNavigate();
  const initialName = typeof window !== 'undefined'
    ? localStorage.getItem('pendingCompanyName') || ''
    : '';
  const [name, setName] = useState(initialName);
  const [primaryColor, setPrimaryColor] = useState('#4F6AF5');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [identityOk, setIdentityOk] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getIdentityStatus()
      .then((data) => {
        if (cancelled) return;
        if (data?.status === 'approved') setIdentityOk(true);
        else { setIdentityOk(false); navigate('/client/verify-identity', { replace: true }); }
      })
      .catch(() => {
        if (!cancelled) { setIdentityOk(false); navigate('/client/login', { replace: true }); }
      });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/clients/', { name, primary_color: primaryColor });
      const client = res.data;
      localStorage.removeItem('pendingCompanyName');
      navigate(`/client/${client.id}/dashboard`);
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.detail
        || (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : null)
        || "Echec de la creation de l'organisation."
      );
    } finally {
      setLoading(false);
    }
  };

  if (identityOk !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center text-nova-text-secondary">
        Verification du statut...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full nova-card p-8">
        <h2 className="text-2xl font-bold mb-1 text-nova-text-primary">Creer votre organisation</h2>
        <p className="text-sm text-nova-text-secondary mb-6">
          Votre identite a ete verifiee. Dernier pas avant l'acces a votre espace.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-nova">Nom de l'organisation</label>
            <input type="text" className="input-nova" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label-nova">Couleur principale</label>
            <input type="color" value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-20 bg-nova-surface-elevated border border-nova-card-border rounded-nova" />
          </div>
          {error && (
            <div className="text-sm text-nova-error bg-red-500/10 border border-red-500/30 rounded-nova p-2">
              {error}
            </div>
          )}
          <button type="submit" disabled={loading || !name.trim()} className="btn-nova-primary w-full">
            {loading ? 'Creation...' : "Creer l'organisation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientCreateCompanyPage;
