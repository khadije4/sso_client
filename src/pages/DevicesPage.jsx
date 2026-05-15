import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user';
import { useAuth } from '../context/AuthContext';

const DevicesPage = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: devices, isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: userApi.getDevices,
    enabled: isAuthenticated
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteDevice,
    onSuccess: () => queryClient.invalidateQueries(['devices'])
  });

  if (isLoading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur : {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Appareils de confiance</h1>
      {devices?.length === 0 ? (
        <p>Aucun appareil enregistré.</p>
      ) : (
        <ul className="space-y-4">
          {devices?.map(device => (
            <li key={device.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{device.device_name}</h2>
                <p className="text-gray-600 text-sm">Dernière utilisation : {new Date(device.last_used).toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Expire le : {new Date(device.expires_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(device.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={deleteMutation.isLoading}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DevicesPage;