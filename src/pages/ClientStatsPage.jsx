import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientStats } from '../api/organisation';

const S = {
  page: { padding: '32px 32px', minHeight: '100vh' },
  card: { background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 16 },
  metricCard: {
    background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB',
    padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  metricValue: { fontSize: 26, fontWeight: 700, color: '#111827' },
  iconBox: (color, bg) => ({
    width: 40, height: 40, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
  }),
  tabBtn: (active) => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: '1px solid',
    borderColor: active ? '#2563EB' : '#E5E7EB',
    background: active ? '#2563EB' : '#FFFFFF',
    color: active ? '#FFFFFF' : '#6B7280',
  }),
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 },
  th: { fontSize: 12, color: '#6B7280', fontWeight: 600, padding: '10px 16px', textAlign: 'left' },
  td: { fontSize: 13, color: '#111827', padding: '12px 16px' },
  statusBadge: (status) => {
    const map = { monitoring: { bg: '#FEF3C7', color: '#92400E' }, blocked: { bg: '#FEE2E2', color: '#991B1B' } };
    const c = map[status] || map.monitoring;
    return { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, ...c };
  },
  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F3F4F6' },
};

const PERIODS = [
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
];

const MetricIcon = ({ type }) => {
  const icons = {
    transactions: <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    success: <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
    suspicious: <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    latency: <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  };
  return icons[type] || icons.transactions;
};

const ClientStatsPage = () => {
  const { clientId } = useOutletContext();
  const [period, setPeriod] = useState('7d');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['clientStats', clientId, period],
    queryFn: () => getClientStats(clientId, period),
    enabled: !!clientId,
  });

  const fmtNum = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Analytics</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>Detailed insights into your security metrics</div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 8, background: '#2563EB', color: '#FFFFFF',
          fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}>
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data
        </button>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {PERIODS.map(p => (
          <button key={p.value} style={S.tabBtn(period === p.value)} onClick={() => setPeriod(p.value)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      {[
        { key: 'total_transactions', label: 'Total Transactions', type: 'transactions', iconColor: '#2563EB', iconBg: '#EFF6FF' },
        { key: 'success_rate', label: 'Success Rate', type: 'success', suffix: '%', iconColor: '#2563EB', iconBg: '#EFF6FF' },
        { key: 'suspicious_activity', label: 'Suspicious Activity', type: 'suspicious', iconColor: '#F59E0B', iconBg: '#FFFBEB' },
        { key: 'avg_latency_ms', label: 'Avg Latency', type: 'latency', suffix: 'ms', iconColor: '#2563EB', iconBg: '#EFF6FF' },
      ].map(m => (
        <div key={m.key} style={S.metricCard}>
          <div>
            <div style={S.metricLabel}>{m.label}</div>
            <div style={S.metricValue}>
              {isLoading ? '…' : (stats?.[m.key] != null ? `${fmtNum(stats[m.key])}${m.suffix || ''}` : '—')}
            </div>
          </div>
          <div style={S.iconBox(m.iconColor, m.iconBg)}>
            <MetricIcon type={m.type} />
          </div>
        </div>
      ))}

      {/* Service Breakdown */}
      <div style={{ ...S.card, marginTop: 8, overflow: 'hidden' }}>
        <div style={S.sectionTitle}>Service Breakdown</div>
        {isLoading ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
        ) : (stats?.service_breakdown?.length ?? 0) === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>No service data. Subscribe to services to see breakdown.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  {['Service', 'Total', 'Normal', 'Suspicious', 'Blocked', 'Latency'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.service_breakdown.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={S.td}>{row.name}</td>
                    <td style={S.td}>{row.total.toLocaleString()}</td>
                    <td style={{ ...S.td, color: '#10B981', fontWeight: 600 }}>{row.normal.toLocaleString()}</td>
                    <td style={{ ...S.td, color: '#F59E0B', fontWeight: 600 }}>{row.suspicious}</td>
                    <td style={{ ...S.td, color: '#EF4444', fontWeight: 600 }}>{row.blocked}</td>
                    <td style={S.td}>{row.avg_latency_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspicious Accounts */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Suspicious Accounts</div>
        {isLoading ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
        ) : (stats?.suspicious_accounts?.length ?? 0) === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>No suspicious accounts detected.</div>
        ) : (
          stats.suspicious_accounts.map((acct, i) => (
            <div key={i} style={{ ...S.metricRow, ':last-child': { borderBottom: 'none' } }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{acct.email}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{acct.failed_attempts} failed attempts</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={S.statusBadge(acct.status)}>
                  {acct.status === 'blocked' ? 'Blocked' : 'Monitoring'}
                </span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{acct.last_seen}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Biometric Auth Metrics */}
      {stats?.biometric_metrics && (
        <div style={S.card}>
          <div style={S.sectionTitle}>Biometric Auth Metrics</div>
          <div>
            {[
              { label: 'Face Recognition Success', value: stats.biometric_metrics.face_recognition_success != null ? `${stats.biometric_metrics.face_recognition_success}%` : null, color: '#10B981' },
              { label: 'Fingerprint Success', value: stats.biometric_metrics.fingerprint_success != null ? `${stats.biometric_metrics.fingerprint_success}%` : null, color: '#10B981' },
              { label: 'Avg Verification Time', value: stats.biometric_metrics.avg_verification_time ?? null, color: '#2563EB' },
              { label: 'Failed Verifications', value: stats.biometric_metrics.failed_verifications ?? null, color: '#F59E0B' },
            ].filter(item => item.value != null).map((item, i, arr) => (
              <div key={item.label} style={{ ...S.metricRow, borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ fontSize: 14, color: '#374151' }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientStatsPage;
