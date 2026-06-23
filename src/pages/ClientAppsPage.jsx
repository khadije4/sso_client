import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientApps, createClientApp, updateClientApp, deleteClientApp } from '../api/organisation';

const S = {
  page: { padding: '32px 32px', minHeight: '100vh' },
  heading: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  card: { background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 12 },
  formCard: { background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '24px', marginBottom: 20 },
  label: { fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6, display: 'block' },
  input: {
    width: '100%', height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none',
    boxSizing: 'border-box', minHeight: 80, resize: 'vertical', fontFamily: 'inherit',
  },
  select: {
    width: '100%', height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none',
    boxSizing: 'border-box', cursor: 'pointer',
  },
  formGroup: { marginBottom: 16 },
  btnPrimary: {
    padding: '9px 20px', borderRadius: 8, background: '#2563EB', color: '#FFFFFF',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
  btnSecondary: {
    padding: '9px 20px', borderRadius: 8, background: '#FFFFFF', color: '#374151',
    fontSize: 14, fontWeight: 600, border: '1px solid #D1D5DB', cursor: 'pointer',
  },
  btnDanger: {
    padding: '6px 14px', borderRadius: 6, background: 'none', color: '#EF4444',
    fontSize: 13, fontWeight: 600, border: '1px solid #FCA5A5', cursor: 'pointer',
  },
  btnEdit: {
    padding: '6px 14px', borderRadius: 6, background: 'none', color: '#2563EB',
    fontSize: 13, fontWeight: 600, border: '1px solid #BFDBFE', cursor: 'pointer',
  },
  badge: (color) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11,
    fontWeight: 500, background: color === 'blue' ? '#EFF6FF' : '#F9FAFB',
    color: color === 'blue' ? '#1D4ED8' : '#6B7280',
  }),
  secretBox: {
    background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10,
    padding: '16px 20px', marginBottom: 20,
  },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8,
    padding: '10px 14px', color: '#B91C1C', fontSize: 13, marginBottom: 12,
  },
  warningBox: {
    background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
    padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10,
  },
  mono: { fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
};

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
    algorithm: 'RS256',
  });

  const subscriptionActive = client?.subscription_active !== false;

  const { data: apps, isLoading } = useQuery({
    queryKey: ['clientApps', clientId],
    queryFn: () => getClientApps(clientId),
    enabled: !!clientId,
  });

  const createMutation = useMutation({
    mutationFn: (appData) => createClientApp(clientId, appData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientApps', clientId]);
      setShowForm(false);
      setNewApp({ name: '', redirect_uris: '', client_type: 'confidential', grant_type: 'authorization-code', algorithm: 'RS256' });
      setServerError('');
      setCreatedSecret({
        client_id: data.client_id,
        client_secret: data.client_secret,
      });
    },
    onError: (err) => {
      const data = err?.response?.data;
      setServerError(
        data?.detail ||
        (typeof data === 'object' ? Object.values(data || {}).flat().join(' ') : null) ||
        'Failed to create application.'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ appId, data }) => updateClientApp(clientId, appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientApps', clientId]);
      setEditingApp(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (appId) => deleteClientApp(clientId, appId),
    onSuccess: () => queryClient.invalidateQueries(['clientApps', clientId]),
  });

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={S.heading}>OAuth2 Applications</div>
          <div style={S.sub}>Manage applications that authenticate via NovaGard SSO</div>
        </div>
        <button
          style={{ ...S.btnPrimary, opacity: subscriptionActive ? 1 : 0.5, cursor: subscriptionActive ? 'pointer' : 'not-allowed' }}
          onClick={() => { if (subscriptionActive) { setShowForm(!showForm); setServerError(''); setCreatedSecret(null); } }}
          title={subscriptionActive ? '' : 'Active subscription required'}
        >
          + New Application
        </button>
      </div>

      {!subscriptionActive && (
        <div style={S.warningBox}>
          <svg style={{ width: 20, height: 20, color: '#F59E0B', flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>Inactive subscription</div>
            <div style={{ fontSize: 13, color: '#92400E', marginTop: 2 }}>
              Renew your plan in Settings to create OAuth applications.
            </div>
          </div>
        </div>
      )}

      {createdSecret && (
        <div style={S.secretBox}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#15803D', marginBottom: 6 }}>
            Application created — save these credentials now
          </div>
          <div style={{ fontSize: 13, color: '#166534', marginBottom: 12 }}>
            The client secret will never be shown again.
          </div>
          <div style={{ ...S.mono, color: '#111827', marginBottom: 4 }}>
            <span style={{ color: '#6B7280' }}>client_id: </span>{createdSecret.client_id}
          </div>
          <div style={{ ...S.mono, color: '#111827', marginBottom: 14 }}>
            <span style={{ color: '#6B7280' }}>client_secret: </span>{createdSecret.client_secret}
          </div>
          <button style={S.btnSecondary} onClick={() => setCreatedSecret(null)}>I've saved it</button>
        </div>
      )}

      {showForm && subscriptionActive && (
        <div style={S.formCard}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 }}>New Application</div>
          <form onSubmit={(e) => { e.preventDefault(); setServerError(''); createMutation.mutate(newApp); }}>
            <div style={S.formGroup}>
              <label style={S.label}>Name</label>
              <input style={S.input} value={newApp.name}
                onChange={(e) => setNewApp({ ...newApp, name: e.target.value })} required />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Redirect URIs (one per line)</label>
              <textarea style={S.textarea} value={newApp.redirect_uris}
                onChange={(e) => setNewApp({ ...newApp, redirect_uris: e.target.value })}
                placeholder="https://yourapp.com/callback" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={S.label}>Client Type</label>
                <select style={S.select} value={newApp.client_type}
                  onChange={(e) => setNewApp({ ...newApp, client_type: e.target.value })}>
                  <option value="confidential">Confidential</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Grant Type</label>
                <select style={S.select} value={newApp.grant_type}
                  onChange={(e) => setNewApp({ ...newApp, grant_type: e.target.value })}>
                  <option value="authorization-code">Authorization Code</option>
                  <option value="client-credentials">Client Credentials</option>
                  <option value="password">Password</option>
                  <option value="implicit">Implicit</option>
                </select>
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Signing Algorithm (ID token)</label>
              <select style={S.select} value={newApp.algorithm}
                onChange={(e) => setNewApp({ ...newApp, algorithm: e.target.value })}>
                <option value="RS256">RS256 (recommended for OIDC)</option>
                <option value="HS256">HS256 (HMAC with client secret)</option>
                <option value="">None (non-OIDC)</option>
              </select>
              <div style={S.hint}>Use RS256 unless you have a specific reason. Without signing, the openid scope won't work.</div>
            </div>
            {serverError && <div style={S.errorBox}>{serverError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={S.btnPrimary} disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Creating…' : 'Create'}
              </button>
              <button type="button" style={S.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
      ) : (apps || []).length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', color: '#9CA3AF', padding: '48px 24px' }}>
          <svg style={{ width: 40, height: 40, color: '#D1D5DB', margin: '0 auto 12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>No applications yet</div>
          <div style={{ fontSize: 13 }}>Create your first OAuth2 application to get started.</div>
        </div>
      ) : (
        (apps || []).map((appWrapper) => {
          const editing = editingApp?.id === appWrapper.id;
          return (
            <div key={appWrapper.id} style={S.card}>
              {!editing ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
                      {appWrapper.name}
                    </div>
                    <div style={{ ...S.mono, color: '#6B7280', marginBottom: 8 }}>
                      client_id: {appWrapper.client_id}
                    </div>
                    {appWrapper.redirect_uris && (
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8, wordBreak: 'break-all' }}>
                        {appWrapper.redirect_uris}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={S.badge('blue')}>{appWrapper.client_type}</span>
                      <span style={S.badge('gray')}>{appWrapper.authorization_grant_type}</span>
                      {appWrapper.algorithm && <span style={S.badge('gray')}>{appWrapper.algorithm}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button style={S.btnEdit} onClick={() => setEditingApp({ ...appWrapper, id: appWrapper.id })}>
                      Edit
                    </button>
                    <button
                      style={S.btnDanger}
                      onClick={() => {
                        if (window.confirm('Delete this application? This cannot be undone.')) {
                          deleteMutation.mutate(appWrapper.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ appId: editingApp.id, data: { name: editingApp.name, redirect_uris: editingApp.redirect_uris } }); }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Edit Application</div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Name</label>
                    <input style={S.input} value={editingApp.name}
                      onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })} required />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Redirect URIs</label>
                    <textarea style={S.textarea} value={editingApp.redirect_uris || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, redirect_uris: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" style={S.btnPrimary} disabled={updateMutation.isLoading}>
                      {updateMutation.isLoading ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" style={S.btnSecondary} onClick={() => setEditingApp(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClientAppsPage;
