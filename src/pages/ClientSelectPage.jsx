import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../api/organisation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ClientSelectPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full nova-card p-8">
        <h2 className="text-2xl font-bold mb-1 text-nova-text-primary">Choisissez votre organisation</h2>
        <p className="text-sm text-nova-text-secondary mb-6">
          Vous gerez plusieurs organisations. Selectionnez celle a ouvrir.
        </p>
        <div className="space-y-2">
          {clients.length === 0 && (
            <div className="text-sm text-nova-text-secondary">Aucune organisation.</div>
          )}
          {clients.map((c) => (
            <button key={c.id}
              onClick={() => navigate(`/client/${c.id}/profile`)}
              className="w-full nova-card p-4 text-left hover:border-nova-primary transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-nova-text-primary">{c.name}</div>
                  <div className="text-xs text-nova-text-hint mt-1">slug : {c.slug}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  c.subscription_active
                    ? 'bg-nova-success/15 text-nova-success'
                    : 'bg-nova-error/15 text-nova-error'
                }`}>
                  {c.subscription_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSelectPage;
