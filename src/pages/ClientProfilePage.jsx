import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient, updateClient } from '../api/organisation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ClientProfilePage = () => {
  const { clientId } = useOutletContext();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', primary_color: '#4F6AF5' });
  const [logoFile, setLogoFile] = useState(null);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClient(clientId),
    enabled: !!clientId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const form = new FormData();
      form.append('name', data.name);
      form.append('primary_color', data.primary_color);
      if (logoFile) form.append('logo', logoFile);
      return updateClient(clientId, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client', clientId]);
      setLogoFile(null);
    },
  });

  useEffect(() => {
    if (client) {
      setFormData({ name: client.name, primary_color: client.primary_color || '#4F6AF5' });
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="nova-card p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-nova-text-primary mb-1">Informations de l'organisation</h2>
      <p className="text-sm text-nova-text-secondary mb-6">
        Personnalisez le nom, la couleur et le logo affiches dans vos applications.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-nova">Nom</label>
          <input type="text" className="input-nova" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <label className="label-nova">Couleur principale</label>
          <input type="color" value={formData.primary_color}
            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
            className="h-10 w-20 bg-nova-surface-elevated border border-nova-card-border rounded-nova" />
        </div>
        <div>
          <label className="label-nova">Logo</label>
          {client?.logo && (
            <img src={client.logo} alt="Logo" className="h-16 w-16 object-contain mb-2 bg-white/5 rounded-nova p-1" />
          )}
          <input type="file" accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
            className="text-sm text-nova-text-secondary file:bg-nova-surface-elevated file:border file:border-nova-card-border file:text-nova-text-primary file:rounded-nova file:px-3 file:py-1.5 file:mr-3" />
        </div>
        <button type="submit" disabled={updateMutation.isLoading} className="btn-nova-primary">
          {updateMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {updateMutation.isError && (
          <div className="text-sm text-nova-error">Erreur lors de la mise a jour.</div>
        )}
      </form>
    </div>
  );
};

export default ClientProfilePage;
