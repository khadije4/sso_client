import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientTeam, inviteTeamMember } from '../api/organisation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ClientTeamPage = () => {
  const { clientId } = useOutletContext();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [role, setRole] = useState('member');
  const [info, setInfo] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['clientTeam', clientId],
    queryFn: () => getClientTeam(clientId),
    enabled: !!clientId,
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => inviteTeamMember(clientId, data.userId, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientTeam', clientId]);
      setInviteEmail('');
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    // L'endpoint d'invitation actuel attend un user_id. Tant qu'il n'y a pas
    // d'endpoint /users/by-email/, on previent l'utilisateur que la fonction
    // n'est pas encore disponible.
    setInfo("Fonctionnalite a implementer : invitation par email.");
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nova-text-primary">Equipe</h2>
        <p className="text-sm text-nova-text-secondary mt-1">
          Gerez les membres de votre organisation et leurs roles.
        </p>
      </div>

      <form onSubmit={handleInvite} className="nova-card p-5">
        <h3 className="font-semibold text-nova-text-primary mb-3">Inviter un membre</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="email" placeholder="Email de l'utilisateur"
            value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            className="input-nova flex-1" required />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-nova sm:w-44">
            <option value="member">Membre</option>
            <option value="admin">Administrateur</option>
          </select>
          <button type="submit" className="btn-nova-primary">Inviter</button>
        </div>
        {info && <div className="mt-3 text-sm text-nova-warning">{info}</div>}
      </form>

      <div className="nova-card divide-y divide-nova-card-border">
        {(members || []).length === 0 && (
          <div className="p-5 text-sm text-nova-text-secondary">Aucun membre.</div>
        )}
        {(members || []).map((m) => (
          <div key={m.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium text-nova-text-primary">{m.user_email}</div>
              <div className="text-xs text-nova-text-hint mt-1">Role : {m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientTeamPage;
