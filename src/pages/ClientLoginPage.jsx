import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClients } from '../api/organisation';
import { getIdentityStatus } from '../api/identity';

const ClientLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const routeAfterAuth = async () => {
    let identity;
    try { identity = await getIdentityStatus(); }
    catch { navigate('/client/verify-identity'); return; }
    if (identity?.status !== 'approved') { navigate('/client/verify-identity'); return; }
    const clients = await getClients().catch(() => []);
    if (clients.length === 1) navigate(`/client/${clients[0].id}/profile`);
    else if (clients.length > 1) navigate('/client/select');
    else navigate('/client/create-company');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(identifier, password, false);
      if (result.mfaRequired) {
        sessionStorage.setItem('redirectAfterMfa', '/client/select');
        navigate('/mfa');
        return;
      }
      if (!result.success) return;
      await routeAfterAuth();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.error === 'email_not_verified') {
        setError("Email non verifie. Verifiez votre boite de reception.");
      } else {
        setError(data?.error || data?.detail || 'Echec de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full nova-card p-8">
        <h2 className="text-2xl font-bold mb-1 text-nova-text-primary">Connexion</h2>
        <p className="text-sm text-nova-text-secondary mb-6">Espace client NovaGard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-nova">Email ou telephone</label>
            <input type="text" className="input-nova" value={identifier}
              onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div>
            <label className="label-nova">Mot de passe</label>
            <input type="password" className="input-nova" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div className="text-sm text-nova-error bg-red-500/10 border border-red-500/30 rounded-nova p-2">
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-nova-primary w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-nova-text-secondary">
          Nouvelle entreprise ?{' '}
          <Link to="/client/signup" className="text-nova-primary hover:text-nova-primary-light underline">
            Creer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginPage;
