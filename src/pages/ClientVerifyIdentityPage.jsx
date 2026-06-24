import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIdentityStatus } from '../api/identity';
import { getClients } from '../api/organisation';

const POLL_INTERVAL_MS = 6000;

const ClientVerifyIdentityPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const advance = async () => {
      try {
        const clients = await getClients();
        if (cancelled) return;
        if (clients.length === 1) navigate(`/client/${clients[0].id}/dashboard`);
        else if (clients.length > 1) navigate('/client/select');
        else navigate('/client/create-company');
      } catch {
        if (!cancelled) navigate('/client/create-company');
      }
    };

    const tick = async () => {
      try {
        const data = await getIdentityStatus();
        if (cancelled) return;
        setStatus(data?.status || null);
        setRejectionReason(data?.rejection_reason || null);
        if (data?.status === 'approved') await advance();
      } catch {
        if (!cancelled) setError("Impossible de recuperer le statut. Reconnectez-vous.");
      }
    };

    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [navigate]);

  const body = () => {
    if (status === 'rejected') {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-nova-error/20 mx-auto flex items-center justify-center text-nova-error text-2xl mb-3">✗</div>
          <h2 className="text-2xl font-bold mb-2 text-nova-text-primary">Verification refusee</h2>
          {rejectionReason && (
            <p className="text-sm text-nova-error bg-red-500/10 border border-red-500/30 rounded-nova p-3 mb-4">
              {rejectionReason}
            </p>
          )}
          <p className="text-sm text-nova-text-secondary mb-6">
            Reessayez la verification depuis l'application mobile NovaGard.
          </p>
        </>
      );
    }
    if (status === 'pending' || status === 'under_review') {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-nova-warning/20 mx-auto flex items-center justify-center text-nova-warning text-2xl mb-3 animate-pulse">⏳</div>
          <h2 className="text-2xl font-bold mb-2 text-nova-text-primary">Verification en cours</h2>
          <p className="text-sm text-nova-text-secondary mb-6">
            Notre equipe examine votre piece d'identite. Cette page se met a jour automatiquement.
          </p>
        </>
      );
    }
    return (
      <>
        <div className="w-16 h-16 rounded-full bg-nova-primary/20 mx-auto flex items-center justify-center text-nova-primary text-2xl mb-3">📱</div>
        <h2 className="text-2xl font-bold mb-2 text-nova-text-primary">Verifiez votre identite</h2>
        <p className="text-sm text-nova-text-secondary mb-6">
          Pour des raisons de securite, la verification d'identite se fait dans l'application mobile NovaGard.
          Connectez-vous sur mobile avec le meme compte et completez la verification (photo de la piece d'identite + selfie).
          Cette page se met a jour automatiquement.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <a href="#" className="btn-nova-secondary text-sm py-2 text-center">Android</a>
          <a href="#" className="btn-nova-secondary text-sm py-2 text-center">iOS</a>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full nova-card p-8 text-center">
        <div className="text-xs text-nova-text-hint uppercase tracking-wider mb-1">Etape 3 sur 3</div>
        {body()}
        {error && <div className="text-sm text-nova-error mb-4">{error}</div>}
        <div className="text-xs text-nova-text-secondary">
          <Link to="/client/login" className="underline hover:text-white">Retour a la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ClientVerifyIdentityPage;
