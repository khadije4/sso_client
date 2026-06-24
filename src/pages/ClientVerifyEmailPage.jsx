import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail as verifyEmailApi, resendVerificationEmail } from '../api/auth';
import { setTokens } from '../utils/tokenStorage';

const ClientVerifyEmailPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await verifyEmailApi(email, code);
      if (result?.access) setTokens(result.access, result.refresh);
      navigate('/client/verify-identity');
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setInfo(''); setError('');
    try {
      await resendVerificationEmail(email);
      setInfo('Un nouveau code a ete envoye.');
    } catch {
      setError("Impossible de renvoyer le code. Reessayez plus tard.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full nova-card p-8">
        <div className="text-xs text-nova-text-hint uppercase tracking-wider mb-1">Etape 2 sur 3</div>
        <h2 className="text-2xl font-bold mb-1 text-nova-text-primary">Verifiez votre email</h2>
        <p className="text-sm text-nova-text-secondary mb-6">
          Nous avons envoye un code a <strong className="text-nova-text-primary">{email || 'votre adresse'}</strong>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!state?.email && (
            <div>
              <label className="label-nova">Email</label>
              <input type="email" className="input-nova" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label-nova">Code de verification</label>
            <input type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="input-nova text-center tracking-[0.5em] text-lg" required />
          </div>
          {error && <div className="text-sm text-nova-error">{error}</div>}
          {info && <div className="text-sm text-nova-success">{info}</div>}
          <button type="submit" disabled={loading || code.length < 6} className="btn-nova-primary w-full">
            {loading ? 'Verification...' : 'Verifier'}
          </button>
          <button type="button" onClick={handleResend}
            className="w-full text-sm text-nova-primary hover:text-nova-primary-light underline">
            Renvoyer le code
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-nova-text-secondary">
          <Link to="/client/login" className="hover:text-white underline">Retour a la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ClientVerifyEmailPage;
