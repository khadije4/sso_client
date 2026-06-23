import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../utils/tokenStorage';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (getAccessToken()) navigate('/client/select');
  }, [navigate]);

  const services = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Fraud Detection',
      desc: 'AI-powered real-time fraud analysis and prevention to protect your users and transactions.',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.12)',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Face Recognition',
      desc: 'Secure biometric authentication using advanced facial recognition technology.',
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.12)',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      ),
      title: 'Fingerprint Auth',
      desc: 'Multi-factor biometric security with fingerprint authentication integration.',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: 'Intrusion Detection',
      desc: 'Advanced threat monitoring and intrusion prevention for your infrastructure.',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Device Trust',
      desc: 'Bot detection and device fingerprinting to ensure only trusted devices access your platform.',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'SSO Integration',
      desc: 'Seamless single sign-on with OAuth2 and OpenID Connect for all your applications.',
      color: '#06B6D4',
      bg: 'rgba(6,182,212,0.12)',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0B0B1A', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{ background: 'rgba(11,11,26,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-white text-lg font-bold tracking-tight">NovaGard</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/client/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-1.5">
                Login
              </Link>
              <Link
                to="/client/signup"
                className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse,#3B82F6 0%,transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#8B5CF6,transparent)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium text-blue-300"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by AI
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            AI-Powered{' '}
            <span style={{ background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FinTech Security
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Comprehensive security microservices for fraud detection, biometric authentication,
            and intrusion prevention — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/client/signup"
              className="px-8 py-3.5 text-base font-semibold text-white rounded-xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', boxShadow: '0 4px 24px rgba(59,130,246,0.35)' }}
            >
              Start Free Trial
            </Link>
            <Link
              to="/client/login"
              className="px-8 py-3.5 text-base font-semibold text-white rounded-xl transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div
          className="rounded-2xl grid grid-cols-2 sm:grid-cols-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<50ms', label: 'Response Time' },
            { value: '500+', label: 'Organizations' },
            { value: '10M+', label: 'Auth Events / Day' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-8 py-6 text-center"
              style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
            >
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <section id="services" className="px-6 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything you need to secure your platform and protect your users.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => (
              <div
                key={s.title}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-28">
        <div
          className="max-w-4xl mx-auto text-center rounded-2xl py-16 px-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.15))', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center,rgba(59,130,246,0.1) 0%,transparent 70%)' }}
          />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to secure your platform?
          </h2>
          <p className="relative text-gray-400 text-lg mb-8">
            Join hundreds of organizations trusting NovaGard with their security.
          </p>
          <Link
            to="/client/signup"
            className="relative inline-block px-10 py-3.5 text-base font-semibold text-white rounded-xl transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', boxShadow: '0 4px 24px rgba(59,130,246,0.4)' }}
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} className="py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">NovaGard Platform</span>
          </div>
          <p className="text-sm text-gray-600">
            © 2026 SecureNova / Namaa Tech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
