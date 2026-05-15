import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClients } from '../../api/organisation';
import LoadingSpinner from '../common/LoadingSpinner';

// Dark client workspace shell that matches the mobile NovaGard look.
// The sidebar exposes the same five sections the user already had:
// Profil, Applications OAuth, Equipe, Statistiques, Abonnement.
const ClientLayout = () => {
  const { clientId } = useParams();
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        if (clientId) {
          const found = data.find((c) => c.id === parseInt(clientId, 10));
          setSelectedClient(found || null);
        } else if (data.length > 0) {
          navigate(`/client/${data[0].id}/profile`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [clientId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!selectedClient && clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-nova-text-secondary p-6">
        Vous n'etes membre d'aucune organisation.
      </div>
    );
  }

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/client/login'); }
  };

  const linkBase = 'block px-3 py-2 rounded-nova text-sm transition';
  const linkActive = 'bg-nova-primary text-white shadow-nova-card';
  const linkIdle = 'text-nova-text-secondary hover:bg-nova-surface-elevated hover:text-white';

  return (
    <div className="flex min-h-screen text-nova-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-nova-surface border-r border-nova-card-border flex flex-col">
        <div className="p-5 border-b border-nova-card-border">
          <div className="text-xs uppercase tracking-wider text-nova-text-hint mb-1">
            Espace client
          </div>
          <h2 className="text-lg font-bold truncate" title={selectedClient?.name}>
            {selectedClient?.name || 'Organisation'}
          </h2>
          {selectedClient && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  selectedClient.subscription_active ? 'bg-nova-success' : 'bg-nova-error'
                }`}
              />
              <span className="text-nova-text-secondary">
                {selectedClient.subscription_active ? 'Abonnement actif' : 'Abonnement inactif'}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to={`/client/${selectedClient?.id}/profile`}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Profil
          </NavLink>
          <NavLink to={`/client/${selectedClient?.id}/apps`}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Applications OAuth
          </NavLink>
          <NavLink to={`/client/${selectedClient?.id}/team`}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Equipe
          </NavLink>
          <NavLink to={`/client/${selectedClient?.id}/stats`}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Statistiques
          </NavLink>
          <NavLink to={`/client/${selectedClient?.id}/subscription`}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Abonnement
          </NavLink>
        </nav>

        {clients.length > 1 && (
          <div className="p-3 border-t border-nova-card-border">
            <button
              onClick={() => navigate('/client/select')}
              className="w-full text-sm text-nova-text-secondary hover:text-white py-2"
            >
              Changer d'organisation
            </button>
          </div>
        )}

        <div className="p-3 border-t border-nova-card-border">
          <button onClick={handleLogout}
            className="w-full text-sm text-nova-error hover:text-red-400 py-2">
            Se deconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet context={{ clientId, client: selectedClient }} />
      </main>
    </div>
  );
};

export default ClientLayout;
