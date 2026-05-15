import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user';
import { useAuth } from '../context/AuthContext';

const AppsPage = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: apps, isLoading, error } = useQuery({
    queryKey: ['apps'],
    queryFn: userApi.getAuthorizedApps,
    enabled: isAuthenticated
  });

  const revokeMutation = useMutation({
    mutationFn: userApi.revokeApp,
    onSuccess: () => queryClient.invalidateQueries(['apps'])
  });

  if (isLoading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur : {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Applications autorisées</h1>
      {apps?.length === 0 ? (
        <p>Aucune application autorisée.</p>
      ) : (
        <ul className="space-y-4">
          {apps?.map(app => (
            <li key={app.application_id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{app.name}</h2>
                <p className="text-gray-600 text-sm">Autorisé le {new Date(app.authorized_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => revokeMutation.mutate(app.application_id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={revokeMutation.isLoading}
              >
                Révoquer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppsPage;