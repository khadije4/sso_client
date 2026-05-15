import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientStats } from '../api/organisation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StatCard = ({ value, label }) => (
  <div className="nova-card p-5">
    <div className="text-3xl font-bold text-nova-text-primary">{value}</div>
    <div className="text-sm text-nova-text-secondary mt-1">{label}</div>
  </div>
);

const ClientStatsPage = () => {
  const { clientId } = useOutletContext();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['clientStats', clientId],
    queryFn: () => getClientStats(clientId),
    enabled: !!clientId,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nova-text-primary">Statistiques</h2>
        <p className="text-sm text-nova-text-secondary mt-1">
          Activite de votre organisation sur les 30 derniers jours.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={stats?.total_users || 0} label="Utilisateurs totaux" />
        <StatCard value={stats?.active_users_last_30_days || 0} label="Utilisateurs actifs (30 j)" />
        <StatCard value={stats?.total_applications || 0} label="Applications OAuth" />
        <StatCard value={stats?.authentications_last_30_days || 0} label="Authentifications (30 j)" />
      </div>
    </div>
  );
};

export default ClientStatsPage;
