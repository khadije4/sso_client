import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/header';

// Dans le return, juste après la div principale :


const StatusDot = ({ type }) => {
  const color = type === 'success' ? 'bg-emerald-500' : 'bg-gray-500';
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
};

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, send straight to the client workspace selector.
    // The mobile-app end-user flow no longer lives in this web app.
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/client/select');
    }
  }, [navigate]);

  // Fonctionnalités pour utilisateurs finaux
  const userFeatures = [
    {
      id: 1,
      name: 'SSO & OAuth2',
      desc: 'Connectez toutes vos applications avec un seul identifiant. Compatible OAuth2, OpenID Connect et PKCE.',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
      panel: [
        { label: 'Flux supportés', value: 'Authorization Code, PKCE, Client Credentials', dot: null },
        { label: 'Jetons', value: 'JWT, opaque', dot: null },
        { label: 'Scopes', value: 'openid, profile, email, phone', dot: 'success' },
      ]
    },
    {
      id: 2,
      name: 'Multi‑facteurs (MFA)',
      desc: 'Renforcez la sécurité avec TOTP, codes par email/SMS.',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      panel: [
        { label: 'TOTP', value: 'Google Authenticator, Authy', dot: 'success' },
        { label: 'Email OTP', value: 'Disponible', dot: null },
        { label: 'SMS OTP', value: 'via Twilio', dot: null },
      ]
    },
    {
      id: 3,
      name: 'Reconnaissance faciale',
      desc: 'Authentification biométrique avec IA – détection de visage, empreinte et vérification.',
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      panel: [
        { label: 'Modèle', value: 'FaceNet (ONNX)', dot: null },
        { label: 'Détection', value: 'MTCNN', dot: null },
        { label: 'Seuil', value: '0.70 configurable', dot: null },
      ]
    }
  ];

  // Fonctionnalités pour clients (organisations)
  const clientFeatures = [
    {
      id: 1,
      name: 'Multi‑tenant complet',
      desc: 'Gérez plusieurs organisations, chacune avec ses utilisateurs, ses applications OAuth et son plan.',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      panel: [
        { label: 'Clients', value: 'Organisations abonnées', dot: null },
        { label: 'Plans', value: 'Basic, Pro, Enterprise', dot: null },
        { label: 'Utilisateurs', value: 'Illimités selon plan', dot: null },
      ]
    },
    {
      id: 2,
      name: 'Applications OAuth2',
      desc: 'Créez et gérez des applications clientes directement depuis votre espace organisation.',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
      panel: [
        { label: 'Client ID / Secret', value: 'Génération automatique', dot: null },
        { label: 'Redirect URIs', value: 'Multiples', dot: null },
        { label: 'Types', value: 'Confidentiel / Public', dot: 'success' },
      ]
    },
    {
      id: 3,
      name: 'Statistiques & équipe',
      desc: 'Visualisez l’activité de vos applications, gérez les membres et leurs rôles.',
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      panel: [
        { label: 'Membres', value: 'Invitations, rôles', dot: null },
        { label: 'Statistiques', value: 'Utilisateurs actifs, authentifications', dot: null },
        { label: 'Abonnement', value: 'Géré par plan', dot: 'success' },
      ]
    }
  ];

  const [activeUserFeature, setActiveUserFeature] = React.useState(0);
  const [activeClientFeature, setActiveClientFeature] = React.useState(0);
  const currentUser = userFeatures[activeUserFeature];
  const currentClient = clientFeatures[activeClientFeature];

  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      {/* Hero Section – général */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/30 to-primary-900/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Votre identité numérique,
              <span className="text-primary-400"> unifiée en toute sécurité</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
              Authentification unique, multi‑facteurs et reconnaissance faciale par IA – le tout dans une même plateforme.
              Intégrez‑la facilement à vos applications.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/client/login"
                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
              >
                Commencer
              </Link>
              <Link
                to="/client/signup"
                className="px-8 py-3 bg-primary-800 border border-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section pour utilisateurs finaux */}
      <section className="px-8 py-24 border-t border-primary-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-medium tracking-widest uppercase text-primary-400">
            Pour vous, utilisateur final
          </div>
          <div
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: 'clamp(26px,3vw,40px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Authentification simple et sécurisée
          </div>
          <p className="text-gray-500 text-base mb-14" style={{ maxWidth: 400, lineHeight: 1.65 }}>
            Connectez‑vous en toute confiance à vos applications préférées.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-3">
              {userFeatures.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setActiveUserFeature(i)}
                  className={`feat-card-hover text-left rounded-2xl p-5 transition-all duration-200 grid gap-4 ${
                    activeUserFeature === i ? 'border-primary-500/40' : ''
                  }`}
                  style={{
                    background: activeUserFeature === i ? 'rgba(47,47,228,0.08)' : '#13131f',
                    border: `1px solid ${
                      activeUserFeature === i ? 'rgba(47,47,228,0.35)' : 'rgba(255,255,255,0.07)'
                    }`,
                    gridTemplateColumns: '44px 1fr',
                    alignItems: 'start',
                  }}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.iconBg} ${f.iconColor}`}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-1">{f.name}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', minHeight: 320 }}
            >
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${currentUser.iconBg} ${currentUser.iconColor}`}>
                  {currentUser.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{currentUser.name}</div>
                  <div className="text-xs text-gray-600">OAuth2 / OpenID Connect</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {currentUser.panel.map(row => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-gray-500">{row.label}</span>
                    <span
                      className={`font-medium flex items-center gap-1.5 ${row.accent ? 'text-primary-400' : 'text-white'}`}
                    >
                      {row.dot && <StatusDot type={row.dot} />}
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section pour clients (organisations) */}
      <section className="px-8 py-24 border-t border-primary-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-medium tracking-widest uppercase text-primary-400">
            Pour votre organisation
          </div>
          <div
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: 'clamp(26px,3vw,40px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Gérez vos utilisateurs et applications
          </div>
          <p className="text-gray-500 text-base mb-14" style={{ maxWidth: 400, lineHeight: 1.65 }}>
            Une plateforme pensée pour les équipes et les entreprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-3">
              {clientFeatures.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setActiveClientFeature(i)}
                  className={`feat-card-hover text-left rounded-2xl p-5 transition-all duration-200 grid gap-4 ${
                    activeClientFeature === i ? 'border-primary-500/40' : ''
                  }`}
                  style={{
                    background: activeClientFeature === i ? 'rgba(47,47,228,0.08)' : '#13131f',
                    border: `1px solid ${
                      activeClientFeature === i ? 'rgba(47,47,228,0.35)' : 'rgba(255,255,255,0.07)'
                    }`,
                    gridTemplateColumns: '44px 1fr',
                    alignItems: 'start',
                  }}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.iconBg} ${f.iconColor}`}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-1">{f.name}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', minHeight: 320 }}
            >
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${currentClient.iconBg} ${currentClient.iconColor}`}>
                  {currentClient.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{currentClient.name}</div>
                  <div className="text-xs text-gray-600">Gestion client</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {currentClient.panel.map(row => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-gray-500">{row.label}</span>
                    <span
                      className={`font-medium flex items-center gap-1.5 ${row.accent ? 'text-primary-400' : 'text-white'}`}
                    >
                      {row.dot && <StatusDot type={row.dot} />}
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action final */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white">Prêt à sécuriser votre identité ?</h2>
          <p className="mt-4 text-xl text-gray-300">
            Rejoignez les milliers d’utilisateurs et d’organisations qui nous font confiance.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/client/login"
              className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition shadow-lg"
            >
              Espace client
            </Link>
            <Link
              to="/client/signup"
              className="inline-block px-8 py-3 bg-primary-800 border border-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-800/50 border-t border-primary-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2025 Plateforme d’Identité. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;