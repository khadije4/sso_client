import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user has any client (organisation)
  const { data: hasClientData } = useQuery({
    queryKey: ['userHasClient'],
    queryFn: () => api.get('/user/has-client/').then(res => res.data.has_client),
    enabled: !!user, // only run when user is logged in
  });

  const hasClient = hasClientData === true;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-primary-800/90 backdrop-blur-sm border-b border-primary-700 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex justify-between h-16">
      <div className="flex space-x-4">
        <Link to="/dashboard" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Accueil
              </Link>
              <Link to="/dashboard/apps" className="flex items-center px-3 py-2 text-gray-200 hover:text-white">
  Applications
</Link>
<Link to="/dashboard/devices" className="flex items-center px-3 py-2 text-gray-200 hover:text-white">
  Appareils
</Link>
<Link to="/dashboard/activity" className="flex items-center px-3 py-2 text-gray-200 hover:text-white">
  Activité
</Link>
<Link to="/settings" className="flex items-center px-3 py-2 text-gray-200 hover:text-white">
  Settings
</Link>
              {/* Only show if user has at least one client */}
              {hasClient && (
                <Link to="/client/login" className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800">
                  Espace client
                </Link>
              )}
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">
                {user?.first_name} {user?.last_name} ({user?.email})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;