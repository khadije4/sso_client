import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientStats } from '../api/organisation';

const S = {
  page: { padding: '32px 32px', minHeight: '100vh' },
  heading: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  card: {
    background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB',
    padding: '20px 24px',
  },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 26, fontWeight: 700, color: '#111827' },
  trend: (positive) => ({ fontSize: 12, fontWeight: 500, color: positive ? '#10B981' : '#EF4444' }),
  iconBox: (color, bg) => ({
    width: 44, height: 44, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
  }),
  dot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }),
};

const StatCard = ({ label, value, trend, trendPositive, iconColor, iconBg, icon }) => (
  <div style={S.card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={S.label}>{label}</div>
        <div style={S.value}>{value}</div>
        {trend && <div style={S.trend(trendPositive)}>{trend}</div>}
      </div>
      <div style={S.iconBox(iconColor, iconBg)}>{icon}</div>
    </div>
  </div>
);

const AlertIcon = ({ type }) => {
  if (type === 'warning') return (
    <svg style={{ width: 18, height: 18, color: '#F59E0B', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
  if (type === 'success') return (
    <svg style={{ width: 18, height: 18, color: '#10B981', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  return (
    <svg style={{ width: 18, height: 18, color: '#2563EB', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
};

const alertBg = { warning: '#FFFBEB', success: '#F0FDF4', info: '#EFF6FF' };
const alertBorder = { warning: '#FDE68A', success: '#BBF7D0', info: '#BFDBFE' };

const ClientDashboardPage = () => {
  const { clientId, client } = useOutletContext();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['clientStats', clientId, '30d'],
    queryFn: () => getClientStats(clientId, '30d'),
    enabled: !!clientId,
  });

  const fmtNum = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div style={S.page}>
      <div style={S.heading}>Organization Dashboard</div>
      <div style={S.sub}>Monitor your security services performance</div>

      {/* Stat cards */}
      <div style={S.cardGrid}>
        <StatCard
          label="Total Users" value={isLoading ? '…' : fmtNum(stats?.total_users)}
          iconColor="#2563EB" iconBg="#EFF6FF"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="API Calls Today" value={isLoading ? '…' : fmtNum(stats?.api_calls_today)}
          iconColor="#2563EB" iconBg="#EFF6FF"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard
          label="Active Services" value={isLoading ? '…' : fmtNum(stats?.active_services)}
          iconColor="#2563EB" iconBg="#EFF6FF"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />
        <StatCard
          label="Total Auths" value={isLoading ? '…' : fmtNum(stats?.total_transactions)}
          iconColor="#2563EB" iconBg="#EFF6FF"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
        />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Service Activity */}
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Service Activity</div>
          {isLoading ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
          ) : (stats?.service_activity?.length ?? 0) === 0 ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>
              No active services.{' '}
              <span
                style={{ color: '#2563EB', cursor: 'pointer' }}
                onClick={() => navigate(`/client/${clientId}/services`)}
              >
                Subscribe to services →
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {stats.service_activity.map(svc => (
                <div key={svc.slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={S.dot(svc.status === 'warning' ? '#F59E0B' : '#10B981')} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{svc.name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>Last hour</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{svc.requests_last_hour.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>requests</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Alerts */}
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Security Alerts</div>
          {isLoading ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
          ) : (stats?.security_alerts?.length ?? 0) === 0 ? (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>No alerts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.security_alerts.map((alert, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 14px', borderRadius: 10,
                    background: alertBg[alert.type] || alertBg.info,
                    border: `1px solid ${alertBorder[alert.type] || alertBorder.info}`,
                  }}
                >
                  <AlertIcon type={alert.type} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{alert.message}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Analysis */}
      {stats?.transaction_analysis && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Transaction Analysis</div>
            <button
              onClick={() => navigate(`/client/${clientId}/analytics`)}
              style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View Full Report
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Normal', value: stats.transaction_analysis.normal_pct != null ? `${stats.transaction_analysis.normal_pct}%` : '—', color: '#10B981', bg: '#F0FDF4' },
              { label: 'Suspicious', value: stats.transaction_analysis.suspicious_pct != null ? `${stats.transaction_analysis.suspicious_pct}%` : '—', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Blocked', value: stats.transaction_analysis.blocked_pct != null ? `${stats.transaction_analysis.blocked_pct}%` : '—', color: '#EF4444', bg: '#FEF2F2' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardPage;
