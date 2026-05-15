import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlans, changeClientPlan, getClient } from '../api/organisation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ClientSubscriptionPage = () => {
  const { clientId } = useOutletContext();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [feedback, setFeedback] = useState({ type: null, msg: '' });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClient(clientId),
    enabled: !!clientId,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const changePlanMutation = useMutation({
    mutationFn: (planId) => changeClientPlan(clientId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['client', clientId]);
      setFeedback({ type: 'ok', msg: 'Plan mis a jour avec succes.' });
      setSelectedPlanId(null);
    },
    onError: (err) => {
      setFeedback({
        type: 'err',
        msg: err?.response?.data?.detail || err?.response?.data?.error || 'Erreur lors du changement de plan.',
      });
    },
  });

  if (clientLoading || plansLoading) return <LoadingSpinner />;

  const onSubmit = () => {
    if (!selectedPlanId) return;
    if (window.confirm('Changer de plan ?')) {
      setFeedback({ type: null, msg: '' });
      changePlanMutation.mutate(selectedPlanId);
    }
  };

  const currentPlan = client?.plan;
  const subEnd = client?.subscription_end;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-nova-text-primary">Abonnement</h2>
        <p className="text-sm text-nova-text-secondary mt-1">
          Consultez votre plan actuel et changez d'abonnement.
        </p>
      </div>

      <div className="nova-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-nova-text-hint uppercase tracking-wider mb-1">Plan actuel</div>
            <div className="text-xl font-bold text-nova-text-primary">{currentPlan?.name || '-'}</div>
            <div className="text-sm text-nova-text-secondary mt-1">
              {currentPlan?.price_monthly ?? '-'} EUR / mois
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${
            client?.subscription_active
              ? 'bg-nova-success/15 text-nova-success'
              : 'bg-nova-error/15 text-nova-error'
          }`}>
            {client?.subscription_active ? 'Actif' : 'Inactif'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <div className="text-nova-text-hint text-xs">Debut</div>
            <div className="text-nova-text-primary">
              {client?.subscription_start ? new Date(client.subscription_start).toLocaleDateString('fr-FR') : '-'}
            </div>
          </div>
          <div>
            <div className="text-nova-text-hint text-xs">Fin</div>
            <div className="text-nova-text-primary">
              {subEnd ? new Date(subEnd).toLocaleDateString('fr-FR') : 'Sans expiration'}
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-nova-text-primary">Changer de plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(plans || []).map((plan) => {
          const selected = selectedPlanId === plan.id;
          const current = currentPlan?.id === plan.id;
          return (
            <button key={plan.id} type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={`text-left nova-card p-4 transition ${
                selected ? 'border-nova-primary shadow-nova-card' : 'hover:border-nova-primary/50'
              }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-nova-text-primary">{plan.name}</div>
                  <div className="text-xs text-nova-text-secondary mt-1">{plan.description}</div>
                </div>
                {current && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-nova-primary/15 text-nova-primary">
                    Actuel
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold text-nova-text-primary mt-3">
                {plan.price_monthly} EUR / mois
              </div>
              {plan.max_users && (
                <div className="text-xs text-nova-text-hint mt-1">Max {plan.max_users} utilisateurs</div>
              )}
            </button>
          );
        })}
      </div>

      {feedback.msg && (
        <div className={`text-sm rounded-nova p-3 border ${
          feedback.type === 'ok'
            ? 'bg-nova-success/10 border-nova-success/30 text-nova-success'
            : 'bg-red-500/10 border-red-500/30 text-nova-error'
        }`}>
          {feedback.msg}
        </div>
      )}

      <button onClick={onSubmit}
        disabled={!selectedPlanId || changePlanMutation.isLoading || selectedPlanId === currentPlan?.id}
        className="btn-nova-primary">
        {changePlanMutation.isLoading ? 'Changement...' : 'Changer de plan'}
      </button>
    </div>
  );
};

export default ClientSubscriptionPage;
