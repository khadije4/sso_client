import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 min-h-screen bg-primary-900">
      <h1 className="text-2xl font-bold text-white mb-2">Tableau de bord</h1>
      <p className="text-gray-300 mb-6">
        Bienvenue, {user?.first_name || user?.email || 'utilisateur'} !
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/apps"
          className="group p-6 bg-primary-800/40 backdrop-blur-sm rounded-2xl shadow-card border border-primary-700 hover:shadow-card-hover transition-all duration-200 hover:bg-primary-800/60"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Applications autorisées</h2>
          <p className="text-gray-400 text-sm">Gérez les applications auxquelles vous avez donné accès.</p>
        </Link>

        <Link
          to="/dashboard/devices"
          className="group p-6 bg-primary-800/40 backdrop-blur-sm rounded-2xl shadow-card border border-primary-700 hover:shadow-card-hover transition-all duration-200 hover:bg-primary-800/60"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Appareils de confiance</h2>
          <p className="text-gray-400 text-sm">Visualisez et révoquez les appareils connectés.</p>
        </Link>

        <Link
          to="/dashboard/activity"
          className="group p-6 bg-primary-800/40 backdrop-blur-sm rounded-2xl shadow-card border border-primary-700 hover:shadow-card-hover transition-all duration-200 hover:bg-primary-800/60"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Historique d’activité</h2>
          <p className="text-gray-400 text-sm">Consultez vos connexions et actions récentes.</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;