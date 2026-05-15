import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as userApi from '../api/user';
import { useAuth } from '../context/AuthContext';

const ActivityPage = () => {
  const { isAuthenticated } = useAuth();

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activity'],
    queryFn: userApi.getActivity,
    enabled: isAuthenticated
  });

  if (isLoading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur : {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Historique d’activité</h1>
      {activities?.length === 0 ? (
        <p>Aucune activité.</p>
      ) : (
        <ul className="space-y-2">
          {activities?.map(activity => (
            <li key={activity.id} className="bg-white shadow rounded p-3">
              <p className="font-semibold">{activity.event_type}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityPage;