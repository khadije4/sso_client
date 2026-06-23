import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApiCredentials, regenerateApiKey,
  getClientServices, subscribeService, unsubscribeService,
} from '../api/organisation';

const S = {
  page: { padding: '32px 32px', minHeight: '100vh' },
  heading: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  card: { background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '24px', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 },
  label: { fontSize: 12, color: '#374151', fontWeight: 500, marginBottom: 6, display: 'block' },
  inputRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 },
  input: {
    flex: 1, height: 40, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#F9FAFB', outline: 'none', fontFamily: 'monospace',
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 8, border: '1px solid #D1D5DB',
    background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#6B7280', flexShrink: 0,
  },
  warningBox: {
    display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 8,
    background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 20,
  },
  btnDanger: {
    padding: '9px 20px', borderRadius: 8, background: '#EF4444', color: '#FFFFFF',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
  serviceCard: (subscribed) => ({
    background: subscribed ? '#F0FDF4' : '#FFFFFF',
    borderRadius: 12, border: `1px solid ${subscribed ? '#BBF7D0' : '#E5E7EB'}`,
    padding: '16px 20px', marginBottom: 12,
  }),
  planBadge: (tier) => {
    const colors = {
      enterprise: { bg: '#F0FDF4', color: '#059669', text: 'Enterprise' },
      professional: { bg: '#F0FDF4', color: '#059669', text: 'Professional' },
      basic: { bg: '#F9FAFB', color: '#6B7280', text: 'Basic' },
    };
    const c = colors[tier] || colors.basic;
    return { ...c, display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: c.bg };
  },
};

const SERVICE_ICONS = {
  'fraud-detection': (
    <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  'face-recognition': (
    <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'fingerprint-auth': (
    <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  ),
  'intrusion-detection': (
    <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'device-trust': (
    <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'sso-integration': (
    <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button style={S.iconBtn} onClick={copy} title="Copy">
      {copied ? (
        <svg style={{ width: 16, height: 16, color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
    </button>
  );
}

const ClientServicesPage = () => {
  const { clientId } = useOutletContext();
  const queryClient = useQueryClient();
  const [secretVisible, setSecretVisible] = useState(false);
  const [regenerated, setRegenerated] = useState(null);

  const { data: creds, isLoading: credsLoading } = useQuery({
    queryKey: ['apiCredentials', clientId],
    queryFn: () => getApiCredentials(clientId),
    enabled: !!clientId,
  });

  const { data: services, isLoading: svcsLoading } = useQuery({
    queryKey: ['clientServices', clientId],
    queryFn: () => getClientServices(clientId),
    enabled: !!clientId,
  });

  const regenMutation = useMutation({
    mutationFn: () => regenerateApiKey(clientId),
    onSuccess: (data) => {
      setRegenerated(data);
      queryClient.invalidateQueries(['apiCredentials', clientId]);
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: (serviceId) => subscribeService(clientId, serviceId),
    onSuccess: () => queryClient.invalidateQueries(['clientServices', clientId]),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (serviceId) => unsubscribeService(clientId, serviceId),
    onSuccess: () => queryClient.invalidateQueries(['clientServices', clientId]),
  });

  const apiKey = regenerated?.api_key ?? creds?.api_key ?? '';
  const apiSecret = regenerated?.api_secret ?? creds?.api_secret ?? '';
  const maskedSecret = apiSecret ? '•'.repeat(Math.min(apiSecret.length, 40)) : '';

  const handleRegenerate = () => {
    if (window.confirm('Regenerate your API keys? Your current keys will stop working immediately.')) {
      regenMutation.mutate();
    }
  };

  return (
    <div style={S.page}>
      <div style={S.heading}>Services</div>
      <div style={S.sub}>Manage your subscribed security services</div>

      {/* API Credentials */}
      <div style={S.card}>
        <div style={S.sectionTitle}>API Credentials</div>

        <div>
          <label style={S.label}>Client ID</label>
          <div style={S.inputRow}>
            <input style={S.input} value={apiKey} readOnly />
            <CopyBtn text={apiKey} />
          </div>
        </div>

        <div>
          <label style={S.label}>Client Secret</label>
          <div style={S.inputRow}>
            <input style={S.input} value={secretVisible ? apiSecret : maskedSecret} readOnly />
            <button style={S.iconBtn} onClick={() => setSecretVisible(v => !v)} title={secretVisible ? 'Hide' : 'Show'}>
              {secretVisible ? (
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            <CopyBtn text={apiSecret} />
          </div>
        </div>

        <div style={S.warningBox}>
          <svg style={{ width: 18, height: 18, color: '#F59E0B', flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>Keep your credentials secure</div>
            <div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>
              Never share your client secret publicly. Store it securely and rotate it regularly.
            </div>
          </div>
        </div>

        <button
          style={S.btnDanger}
          onClick={handleRegenerate}
          disabled={regenMutation.isLoading}
        >
          {regenMutation.isLoading ? 'Regenerating…' : 'Regenerate Keys'}
        </button>
      </div>

      {/* Available Services */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Available Services</div>

        {svcsLoading ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading services…</div>
        ) : (
          (services || []).map(svc => {
            const planStyle = S.planBadge(svc.min_plan_tier);
            const icon = SERVICE_ICONS[svc.slug];
            return (
              <div key={svc.id} style={S.serviceCard(svc.subscribed)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: '#F0FDF4', color: '#059669',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{svc.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>{svc.description}</div>
                    <span style={planStyle}>{planStyle.text}</span>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 4 }}>
                    {svc.subscribed ? (
                      <button
                        onClick={() => unsubscribeMutation.mutate(svc.id)}
                        disabled={unsubscribeMutation.isLoading}
                        style={{ fontSize: 14, fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Unsubscribe
                      </button>
                    ) : (
                      <button
                        onClick={() => subscribeMutation.mutate(svc.id)}
                        disabled={subscribeMutation.isLoading}
                        style={{
                          padding: '8px 20px', borderRadius: 8, background: '#2563EB',
                          color: '#FFFFFF', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}
                      >
                        Subscribe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientServicesPage;
