import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

// OAuth-application management for the current organisation.
//
// Creation is gated server-side on Client.subscription_active. We mirror
// that gate in the UI: when the organisation has no active subscription,
// the "+ Nouvelle application" button is disabled and replaced with a
// renewal banner so the user understands why.
const ClientAppsPage = () => {
  const { clientId, client } = useOutletContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [serverError, setServerError] = useState('');
  const [createdSecret, setCreatedSecret] = useState(null);
  const [newApp, setNewApp] = useState({
    name: '', redirect_uris: '',
    client_type: 'confidential', grant_type: 'authorization-code',
    // RS256 is the OIDC default and matches the JWKS our backend publishes.
    // HS256 = HMAC with the client_secret (no RSA key needed). '' = no signing
    // (token endpoint will refuse openid scope for that app).
    algorithm: 'RS256',
  });

  const subscriptionActive = client?.subscription_active !== false; // default-open

  const { data: apps, isLoading } = useQuery({
    queryKey: ['clientApps', clientId],
    queryFn: () => api.get(`/clients/${clientId}/apps/`).then((r) => r.data),
    enabled: !!clientId,
  });

  const createMutation = useMutation({
    mutationFn: (appData) => api.post(`/clients/${clientId}/apps/`, appData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['clientApps', clientId]);
      setShowForm(false);
      setNewApp({ name: '', redirect_uris: '', client_type: 'confidential', grant_type: 'authorization-code', algorithm: 'RS256' });
      setServerError('');
      setCreatedSecret({
        client_id: response.data.client_id,
        client_secret: response.data.client_secret,
      });
    },
    onError: (err) => {
      const data = err?.response?.data;
      setServerError(
        data?.detail ||
          (typeof data === 'object' ? Object.values(data || {}).flat().join(' ') : null) ||
          "Echec de la creation de l'application."
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ appId, data }) => api.put(`/clients/${clientId}/apps/${appId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientApps', clientId]);
      setEditingApp(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (appId) => api.delete(`/clients/${clientId}/apps/${appId}/`),
    onSuccess: () => queryClient.invalidateQueries(['clientApps', clientId]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    createMutation.mutate(newApp);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({ appId: editingApp.id, data: editingApp });
  };

  const handleDelete = (appId) => {
    if (window.confirm('Supprimer definitivement cette application ?')) {
      deleteMutation.mutate(appId);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-nova-text-primary">Applications OAuth2</h2>
          <p className="text-sm text-nova-text-secondary mt-1">
            Gerez les applications qui se connectent via NovaGard SSO.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setServerError('');
            setCreatedSecret(null);
          }}
          disabled={!subscriptionActive}
          title={subscriptionActive ? '' : "Abonnement requis pour creer une application."}
          className="btn-nova-primary"
        >
          + Nouvelle application
        </button>
      </div>

      {!subscriptionActive && (
        <div className="nova-card p-4 border-nova-warning">
          <div className="flex items-start gap-3">
            <div className="text-nova-warning text-xl leading-none">⚠</div>
            <div className="text-sm">
              <div className="font-semibold text-nova-text-primary mb-1">
                Abonnement inactif
              </div>
              <div className="text-nova-text-secondary">
                Votre organisation n'a pas d'abonnement actif. Renouvelez votre plan dans la
                section <span className="text-nova-primary">Abonnement</span> pour pouvoir creer
                de nouvelles applications OAuth.
              </div>
            </div>
          </div>
        </div>
      )}

      {createdSecret && (
        <div className="nova-card p-4 border-nova-accent">
          <div className="font-semibold mb-2 text-nova-text-primary">
            Application creee. Conservez ces identifiants en lieu sur.
          </div>
          <div className="text-sm text-nova-text-secondary">Le secret ne sera plus jamais affiche.</div>
          <div className="mt-3 space-y-1 text-sm font-mono">
            <div><span className="text-nova-text-hint">client_id :</span> {createdSecret.client_id}</div>
            <div><span className="text-nova-text-hint">client_secret :</span> {createdSecret.client_secret}</div>
          </div>
          <button
            onClick={() => setCreatedSecret(null)}
            className="mt-3 text-sm text-nova-primary hover:text-nova-primary-light"
          >
            J'ai sauvegarde
          </button>
        </div>
      )}

      {showForm && subscriptionActive && (
        <form onSubmit={handleSubmit} className="nova-card p-5 space-y-3">
          <h3 className="font-semibold text-nova-text-primary mb-2">Nouvelle application</h3>
          <div>
            <label className="label-nova">Nom</label>
            <input className="input-nova" value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })} required />
          </div>
          <div>
            <label className="label-nova">URLs de redirection (une par ligne)</label>
            <textarea className="input-nova min-h-[80px]" value={newApp.redirect_uris}
              onChange={(e) => setNewApp({ ...newApp, redirect_uris: e.target.value })}
              placeholder="https://exemple.com/callback" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-nova">Type de client</label>
              <select className="input-nova" value={newApp.client_type}
                onChange={(e) => setNewApp({ ...newApp, client_type: e.target.value })}>
                <option value="confidential">Confidentiel</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div>
              <label className="label-nova">Type d'autorisation</label>
              <select className="input-nova" value={newApp.grant_type}
                onChange={(e) => setNewApp({ ...newApp, grant_type: e.target.value })}>
                <option value="authorization-code">Authorization Code</option>
                <option value="client-credentials">Client Credentials</option>
                <option value="password">Password</option>
                <option value="implicit">Implicit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-nova">Algorithme de signature (ID token)</label>
            <select className="input-nova" value={newApp.algorithm}
              onChange={(e) => setNewApp({ ...newApp, algorithm: e.target.value })}>
              <option value="RS256">RS256 (recommande pour OIDC)</option>
              <option value="HS256">HS256 (HMAC avec le client secret)</option>
              <option value="">Aucune signature (non-OIDC)</option>
            </select>
            <div className="text-xs text-nova-text-hint mt-1">
              Choisissez RS256 sauf si vous savez ce que vous faites. Sans signature, les jetons OIDC ne pourront pas etre signes et la scope openid ne fonctionnera pas.
            </div>
          </div>
          {serverError && (
            <div className="text-sm text-nova-error bg-red-500/10 border border-red-500/30 rounded-nova p-2">
              {serverError}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={createMutation.isLoading} className="btn-nova-primary">
              {createMutation.isLoading ? 'Creation...' : 'Creer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-nova-secondary">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {(apps || []).length === 0 && (
          <div className="nova-card p-6 text-center text-nova-text-secondary">
            Aucune application pour le moment.
          </div>
        )}
        {(apps || []).map((appWrapper) => {
          const a = appWrapper.application || appWrapper;
          const editing = editingApp?.id === appWrapper.id;
          return (
            <div key={appWrapper.id} className="nova-card p-4">
              {!editing ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-nova-text-primary truncate">{a.name}</div>
                    <div className="text-xs text-nova-text-hint font-mono mt-1 break-all">
                      client_id : {appWrapper.client_id || a.client_id}
                    </div>
                    {a.redirect_uris && (
                      <div className="text-xs text-nova-text-secondary mt-2 break-all">
                        {a.redirect_uris}
                      </div>
                    )}
                    <div className="text-xs text-nova-text-hint mt-1">
                      Type : {a.client_type} · {a.authorization_grant_type}
                      {a.algorithm ? ` · alg: ${a.algorithm}` : ' · alg: aucune'}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditingApp({ ...a, id: appWrapper.id })}
                      className="text-sm text-nova-primary hover:text-nova-primary-light">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(appWrapper.id)}
                      className="text-sm text-nova-error hover:text-red-400">
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <div>
                    <label className="label-nova">Nom</label>
                    <input className="input-nova" value={editingApp.name}
                      onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-nova">URLs de redirection</label>
                    <textarea className="input-nova min-h-[80px]" value={editingApp.redirect_uris || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, redirect_uris: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-nova-primary">Enregistrer</button>
                    <button type="button" onClick={() => setEditingApp(null)} className="btn-nova-secondary">
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientAppsPage;
