import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient, updateClientSettings, getPlans, changeClientPlan } from '../api/organisation';

const S = {
  page: { padding: '32px 32px', minHeight: '100vh' },
  heading: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  card: { background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '24px', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 },
  label: { fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6, display: 'block' },
  input: {
    width: '100%', height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, color: '#111827',
    border: '1px solid #D1D5DB', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
    cursor: 'pointer',
  },
  formGroup: { marginBottom: 16 },
  btnPrimary: {
    padding: '10px 22px', borderRadius: 8, background: '#2563EB', color: '#FFFFFF',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 22px', borderRadius: 8, background: '#FFFFFF', color: '#374151',
    fontSize: 14, fontWeight: 600, border: '1px solid #D1D5DB', cursor: 'pointer',
  },
  toggleRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', borderRadius: 10, border: '1px solid #E5E7EB',
    background: '#F9FAFB', marginBottom: 12,
  },
  checkRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
};

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: checked ? '#2563EB' : '#D1D5DB',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20,
      borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s',
    }} />
  </button>
);

const Checkbox = ({ checked, onChange, label }) => (
  <div style={S.checkRow}>
    <input
      type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#2563EB' }}
    />
    <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
  </div>
);

const ClientSettingsPage = () => {
  const { clientId } = useOutletContext();
  const queryClient = useQueryClient();

  const [org, setOrg] = useState({ name: '', industry: '', company_size: '' });
  const [security, setSecurity] = useState({
    enforce_mfa: false,
    session_timeout_minutes: 15,
    pw_require_uppercase: true,
    pw_require_numbers: true,
    pw_require_special: true,
    pw_min_length: 12,
  });
  const [notifications, setNotifications] = useState({ email_notifications: true });
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClient(clientId),
    enabled: !!clientId,
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  useEffect(() => {
    if (!client) return;
    setOrg({ name: client.name || '', industry: client.industry || '', company_size: client.company_size || '' });
    setSecurity({
      enforce_mfa: client.enforce_mfa ?? false,
      session_timeout_minutes: client.session_timeout_minutes ?? 15,
      pw_require_uppercase: client.pw_require_uppercase ?? true,
      pw_require_numbers: client.pw_require_numbers ?? true,
      pw_require_special: client.pw_require_special ?? true,
      pw_min_length: client.pw_min_length ?? 12,
    });
    setNotifications({ email_notifications: client.email_notifications ?? true });
  }, [client]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateClientSettings(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['client', clientId]);
      setErrorMsg('');
      setSavedMsg('Changes saved successfully.');
      setTimeout(() => setSavedMsg(''), 3000);
    },
    onError: (err) => {
      const msg = err?.response?.data?.detail
        || (typeof err?.response?.data === 'string' ? err.response.data : null)
        || 'Failed to save. Please try again.';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    },
  });

  const planMutation = useMutation({
    mutationFn: (planId) => changeClientPlan(clientId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['client', clientId]);
      setSavedMsg('Plan updated successfully.');
      setTimeout(() => setSavedMsg(''), 3000);
    },
    onError: () => {
      setErrorMsg('Failed to change plan. Please try again.');
      setTimeout(() => setErrorMsg(''), 5000);
    },
  });

  const handleSaveOrg = (e) => {
    e.preventDefault();
    saveMutation.mutate(org);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    saveMutation.mutate(security);
  };

  const handleSaveNotifications = () => {
    saveMutation.mutate(notifications);
  };

  const currentPlan = client?.plan;

  if (isLoading) return <div style={{ padding: 32, color: '#9CA3AF' }}>Loading…</div>;

  return (
    <div style={S.page}>
      <div style={S.heading}>Organization Settings</div>
      <div style={S.sub}>Manage your organization preferences</div>

      {savedMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, background: '#F0FDF4',
          border: '1px solid #BBF7D0', color: '#15803D', fontSize: 13, fontWeight: 500,
          marginBottom: 20,
        }}>
          ✓ {savedMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, background: '#FEF2F2',
          border: '1px solid #FCA5A5', color: '#B91C1C', fontSize: 13, fontWeight: 500,
          marginBottom: 20,
        }}>
          {errorMsg}
        </div>
      )}

      {/* Organization Information */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Organization Information</div>
        <form onSubmit={handleSaveOrg}>
          <div style={S.formGroup}>
            <label style={S.label}>Organization Name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: '#9CA3AF',
              }}>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <input
                style={{ ...S.input, paddingLeft: 36 }}
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>Industry</label>
            <select
              style={S.select}
              value={org.industry}
              onChange={(e) => setOrg({ ...org, industry: e.target.value })}
            >
              <option value="">Select industry</option>
              <option value="financial_services">Financial Services</option>
              <option value="healthcare">Healthcare</option>
              <option value="technology">Technology</option>
              <option value="retail">Retail</option>
              <option value="education">Education</option>
              <option value="government">Government</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ ...S.formGroup, marginBottom: 20 }}>
            <label style={S.label}>Company Size</label>
            <select
              style={S.select}
              value={org.company_size}
              onChange={(e) => setOrg({ ...org, company_size: e.target.value })}
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          <button type="submit" style={S.btnPrimary} disabled={saveMutation.isLoading}>
            {saveMutation.isLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Security Policies */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Security Policies</div>
        <form onSubmit={handleSaveSecurity}>
          {/* MFA toggle */}
          <div style={S.toggleRow}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', color: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Enforce MFA for All Users</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Require multi-factor authentication for all organization users
                </div>
              </div>
            </div>
            <Toggle
              checked={security.enforce_mfa}
              onChange={(v) => setSecurity({ ...security, enforce_mfa: v })}
            />
          </div>

          {/* Session timeout */}
          <div style={{ ...S.formGroup, marginTop: 16 }}>
            <label style={S.label}>Session Timeout</label>
            <select
              style={S.select}
              value={security.session_timeout_minutes}
              onChange={(e) => setSecurity({ ...security, session_timeout_minutes: parseInt(e.target.value) })}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          {/* Password policy */}
          <div style={{ ...S.formGroup, marginBottom: 20 }}>
            <label style={S.label}>Password Policy</label>
            <Checkbox
              checked={security.pw_require_uppercase}
              onChange={(v) => setSecurity({ ...security, pw_require_uppercase: v })}
              label="Require uppercase letters"
            />
            <Checkbox
              checked={security.pw_require_numbers}
              onChange={(v) => setSecurity({ ...security, pw_require_numbers: v })}
              label="Require numbers"
            />
            <Checkbox
              checked={security.pw_require_special}
              onChange={(v) => setSecurity({ ...security, pw_require_special: v })}
              label="Require special characters"
            />
            <Checkbox
              checked={security.pw_min_length >= 12}
              onChange={(v) => setSecurity({ ...security, pw_min_length: v ? 12 : 8 })}
              label="Minimum 12 characters"
            />
          </div>

          <button type="submit" style={S.btnPrimary} disabled={saveMutation.isLoading}>
            {saveMutation.isLoading ? 'Saving…' : 'Save Security Settings'}
          </button>
        </form>
      </div>

      {/* Billing */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Billing Information</div>

        {/* Current plan */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderRadius: 10, background: '#F0F4FF',
          border: '1px solid #BFDBFE', marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Current Plan</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{currentPlan?.name || '—'}</div>
            {currentPlan?.price_monthly && (
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{currentPlan.price_monthly} EUR/mo</div>
            )}
          </div>
          <select
            style={{ ...S.select, width: 'auto', minWidth: 140 }}
            value={currentPlan?.id || ''}
            onChange={(e) => {
              if (e.target.value && window.confirm('Change plan?')) {
                planMutation.mutate(parseInt(e.target.value));
              }
            }}
          >
            <option value="">Upgrade Plan</option>
            {(plans || []).filter(p => p.id !== currentPlan?.id).map(p => (
              <option key={p.id} value={p.id}>{p.name} – {p.price_monthly} EUR/mo</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Notifications</div>
        <div style={S.toggleRow}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#F9FAFB', color: '#6B7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Email Notifications</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Receive alerts via email</div>
            </div>
          </div>
          <Toggle
            checked={notifications.email_notifications}
            onChange={(v) => {
              setNotifications({ email_notifications: v });
              saveMutation.mutate({ email_notifications: v });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientSettingsPage;
