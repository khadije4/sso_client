import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';

const ClientSignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '', first_name: '', last_name: '',
    email: '', phone: '', password: '', password2: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setGlobalError('');
    if (form.password !== form.password2) {
      setErrors({ password2: ['Les mots de passe ne correspondent pas.'] });
      return;
    }
    setLoading(true);
    try {
      const { company_name, ...userPayload } = form;
      const result = await signup(userPayload);
      if (company_name) localStorage.setItem('pendingCompanyName', company_name);
      navigate('/client/verify-email', { state: { email: result.email || form.email } });
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setErrors(data);
        if (data.detail) setGlobalError(String(data.detail));
      } else {
        setGlobalError("Echec de la creation du compte. Reessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) => {
    const v = errors[name];
    if (!v) return null;
    return <div className="text-xs text-nova-error mt-1">{Array.isArray(v) ? v[0] : String(v)}</div>;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full nova-card p-8">
        <div className="text-xs text-nova-text-hint uppercase tracking-wider mb-1">Etape 1 sur 3</div>
        <h2 className="text-2xl font-bold mb-1 text-nova-text-primary">Creer un espace client</h2>
        <p className="text-sm text-nova-text-secondary mb-6">
          Inscrivez votre entreprise. Vous devrez ensuite verifier votre email puis votre identite.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-nova">Nom de l'entreprise</label>
            <input type="text" className="input-nova" value={form.company_name}
              onChange={(e) => setField('company_name', e.target.value)} required />
            {fieldError('company_name')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-nova">Prenom</label>
              <input type="text" className="input-nova" value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)} required />
              {fieldError('first_name')}
            </div>
            <div>
              <label className="label-nova">Nom</label>
              <input type="text" className="input-nova" value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)} required />
              {fieldError('last_name')}
            </div>
          </div>
          <div>
            <label className="label-nova">Email</label>
            <input type="email" className="input-nova" value={form.email}
              onChange={(e) => setField('email', e.target.value)} required />
            {fieldError('email')}
          </div>
          <div>
            <label className="label-nova">Telephone (optionnel)</label>
            <input type="tel" className="input-nova" value={form.phone}
              onChange={(e) => setField('phone', e.target.value)} />
            {fieldError('phone')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-nova">Mot de passe</label>
              <input type="password" className="input-nova" value={form.password}
                onChange={(e) => setField('password', e.target.value)} required minLength={8} />
              {fieldError('password')}
            </div>
            <div>
              <label className="label-nova">Confirmer</label>
              <input type="password" className="input-nova" value={form.password2}
                onChange={(e) => setField('password2', e.target.value)} required minLength={8} />
              {fieldError('password2')}
            </div>
          </div>
          {globalError && (
            <div className="text-sm text-nova-error bg-red-500/10 border border-red-500/30 rounded-nova p-2">
              {globalError}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-nova-primary w-full">
            {loading ? 'Creation en cours...' : 'Continuer'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-nova-text-secondary">
          Deja inscrit ?{' '}
          <Link to="/client/login" className="text-nova-primary hover:text-nova-primary-light underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientSignupPage;
