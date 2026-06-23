import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Header from '../components/Layout/Header';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, qrLogin, faceIdentifyLogin } = useAuth();

  const params = new URLSearchParams(location.search);
  const nextUrl = params.get('next');

  // Which top-level mode the user picked
  const [mode, setMode] = useState('password'); // 'password' | 'qr' | 'face'

  // Password flow state
  const [step, setStep] = useState('identifier'); // 'identifier' | 'method' | 'mfa'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMethod, setMfaMethod] = useState('totp');
  const [availableMethods, setAvailableMethods] = useState({
    has_password: false,
    has_biometric: false,
    mfa_methods: [],
  });
  const [mfaToken, setMfaToken] = useState(null);

  // QR flow state
  const [qrData, setQrData] = useState(null); // { token, qr_code, expires_at }
  const [qrStatus, setQrStatus] = useState('idle'); // 'idle' | 'waiting' | 'confirmed' | 'expired'
  const qrPollRef = useRef(null);

  // Face identify state
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── QR helpers ────────────────────────────────────────────────────────────

  const stopQrPoll = useCallback(() => {
    if (qrPollRef.current) { clearInterval(qrPollRef.current); qrPollRef.current = null; }
  }, []);

  const generateQR = useCallback(async () => {
    stopQrPoll();
    setQrStatus('waiting');
    setError('');
    try {
      const res = await api.post('/qr-login/generate/');
      setQrData(res.data);
      qrPollRef.current = setInterval(async () => {
        try {
          const poll = await api.get(`/qr-login/${res.data.token}/status/`);
          const s = poll.data.status;
          if (s === 'confirmed') {
            stopQrPoll();
            setQrStatus('confirmed');
            if (nextUrl) {
              window.location.href = nextUrl;
            } else {
              await qrLogin(poll.data.access, poll.data.refresh);
            }
          } else if (s === 'expired' || s === 'invalid') {
            stopQrPoll();
            setQrStatus('expired');
          }
        } catch (_) { /* keep polling on transient error */ }
      }, 2000);
    } catch (e) {
      setError('Impossible de générer le QR code.');
      setQrStatus('idle');
    }
  }, [stopQrPoll, nextUrl, qrLogin]);

  useEffect(() => {
    if (mode === 'qr') generateQR();
    else stopQrPoll();
    return stopQrPoll;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Camera helpers ────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (e) {
      setError('Impossible d\'accéder à la caméra.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      setFaceFile(file);
      setFacePreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  useEffect(() => {
    if (mode !== 'face') stopCamera();
    return stopCamera;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Password flow ─────────────────────────────────────────────────────────

  const checkUser = async (e) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/user/auth-methods/?identifier=${encodeURIComponent(identifier)}`);
      if (!res.data.exists) {
        setError('Utilisateur non trouvé. Veuillez vous inscrire.');
        return;
      }
      setAvailableMethods({
        has_password: res.data.has_password,
        has_biometric: res.data.has_biometric,
        mfa_methods: res.data.mfa_methods || [],
      });
      setStep('method');
    } catch (_) {
      setError('Impossible de vérifier l\'utilisateur.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      if (nextUrl) {
        const sessionResp = await api.post('/session-login/', { identifier, password });
        if (sessionResp.data.status === 'ok') {
          window.location.href = nextUrl;
          return;
        }
        throw new Error('Session login failed');
      } else {
        const result = await login(identifier, password);
        if (result.mfaRequired) {
          setMfaToken(result.mfaToken);
          setStep('mfa');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Échec de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    navigate('/biometric/login', { state: { identifier, nextUrl } });
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    if (!mfaCode) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/mfa/verify/', { mfa_token: mfaToken, code: mfaCode, method: mfaMethod });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  // ── Face identify flow ────────────────────────────────────────────────────

  const handleFaceIdentify = async () => {
    if (!faceFile) return;
    setLoading(true);
    setError('');
    try {
      await faceIdentifyLogin(faceFile, !nextUrl);
      if (nextUrl) window.location.href = nextUrl;
    } catch (err) {
      setError(err.response?.data?.detail || 'Visage non reconnu.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared shell ──────────────────────────────────────────────────────────

  const card = (children) => (
    <div className="min-h-screen bg-primary-900">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-primary-900 pt-16">
        <div className="max-w-md w-full p-8 bg-primary-800/40 backdrop-blur-sm rounded-2xl shadow-card border border-primary-700">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-6 bg-primary-900/60 rounded-xl p-1">
            {[['password','Mot de passe'],['qr','QR Code'],['face','Visage']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStep('identifier'); setError(''); setFaceFile(null); setFacePreview(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {error && <div className="text-red-400 text-sm mb-4 text-center">{error}</div>}
          {children}
        </div>
      </div>
    </div>
  );

  // ── QR mode ───────────────────────────────────────────────────────────────

  if (mode === 'qr') return card(
    <div className="text-center">
      <p className="text-sm text-gray-400 mb-4">
        Ouvrez l'application NovaGard sur votre téléphone et scannez ce code.
      </p>
      {qrData?.qr_code ? (
        <img src={qrData.qr_code} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border border-primary-700 mb-4" />
      ) : (
        <div className="w-48 h-48 mx-auto rounded-xl border border-primary-700 mb-4 flex items-center justify-center text-gray-500 text-sm">
          Chargement…
        </div>
      )}
      {qrStatus === 'waiting' && (
        <p className="text-sm text-gray-400 animate-pulse">En attente du scan…</p>
      )}
      {qrStatus === 'confirmed' && (
        <p className="text-sm text-green-400">Connecté ! Redirection…</p>
      )}
      {qrStatus === 'expired' && (
        <div>
          <p className="text-sm text-red-400 mb-3">Code expiré.</p>
          <button onClick={generateQR} className="text-primary-400 text-sm hover:underline">
            Générer un nouveau code
          </button>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-gray-400">
        Pas encore de compte ?{' '}
        <a href="/signup" className="text-primary-400 hover:underline">S'inscrire</a>
      </p>
    </div>
  );

  // ── Face identify mode ────────────────────────────────────────────────────

  if (mode === 'face') return card(
    <div className="text-center">
      <p className="text-sm text-gray-400 mb-4">
        Prenez une photo de votre visage pour vous identifier automatiquement.
      </p>
      {!cameraActive && !facePreview && (
        <button
          onClick={startCamera}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition mb-4"
        >
          Activer la caméra
        </button>
      )}
      {cameraActive && (
        <div className="mb-4">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl mb-3 border border-primary-700" />
          <button
            onClick={capturePhoto}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Prendre la photo
          </button>
        </div>
      )}
      {facePreview && (
        <div className="mb-4">
          <img src={facePreview} alt="Aperçu" className="w-40 h-40 object-cover rounded-full mx-auto mb-3 border-2 border-primary-500" />
          <div className="flex gap-2">
            <button
              onClick={() => { setFaceFile(null); setFacePreview(null); }}
              className="flex-1 border border-primary-700 text-gray-300 py-2 rounded-xl text-sm hover:border-primary-500 transition"
            >
              Reprendre
            </button>
            <button
              onClick={handleFaceIdentify}
              disabled={loading}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Identification…' : 'S\'identifier'}
            </button>
          </div>
        </div>
      )}
      {!cameraActive && !facePreview && (
        <div className="mt-2">
          <label className="text-xs text-gray-500 block mb-2">Ou charger une photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const f = e.target.files[0];
              if (f) { setFaceFile(f); setFacePreview(URL.createObjectURL(f)); }
            }}
            className="text-sm text-gray-400"
          />
        </div>
      )}
      <p className="mt-6 text-center text-sm text-gray-400">
        Pas encore de compte ?{' '}
        <a href="/signup" className="text-primary-400 hover:underline">S'inscrire</a>
      </p>
    </div>
  );

  // ── Password mode — step: identifier ─────────────────────────────────────

  if (step === 'identifier') return card(
    <>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Connexion</h2>
      {nextUrl && (
        <p className="text-sm text-gray-400 mb-4 text-center">
          Vous allez autoriser une application externe à accéder à vos données.
        </p>
      )}
      <form onSubmit={checkUser}>
        <input
          type="text"
          placeholder="Email ou numéro de téléphone"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          className="w-full bg-primary-800 border border-primary-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Vérification…' : 'Continuer'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Pas encore de compte ?{' '}
        <a href="/signup" className="text-primary-400 hover:underline">S'inscrire</a>
      </p>
    </>
  );

  // ── Password mode — step: method ──────────────────────────────────────────

  if (step === 'method') return card(
    <>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Choisissez une méthode</h2>
      <div className="space-y-3">
        {availableMethods.has_password && (
          <form onSubmit={handlePasswordLogin}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-primary-800 border border-primary-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter avec mot de passe'}
            </button>
          </form>
        )}
        {availableMethods.has_biometric && (
          <button
            onClick={handleBiometricLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Reconnaissance faciale (avec identifiant)
          </button>
        )}
      </div>
      <button
        onClick={() => setStep('identifier')}
        className="mt-6 text-primary-400 text-sm hover:underline block mx-auto"
      >
        ← Retour
      </button>
    </>
  );

  // ── Password mode — step: mfa ─────────────────────────────────────────────

  if (step === 'mfa') return card(
    <>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Double authentification</h2>
      <form onSubmit={handleMfaVerify}>
        {availableMethods.mfa_methods.length > 0 && (
          <select
            value={mfaMethod}
            onChange={e => setMfaMethod(e.target.value)}
            className="w-full bg-primary-800 border border-primary-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {availableMethods.mfa_methods.map(m => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Code de vérification"
          value={mfaCode}
          onChange={e => setMfaCode(e.target.value)}
          className="w-full bg-primary-800 border border-primary-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Vérification…' : 'Vérifier'}
        </button>
      </form>
      <button
        onClick={() => setStep('method')}
        className="mt-6 text-primary-400 text-sm hover:underline block mx-auto"
      >
        ← Retour
      </button>
    </>
  );

  return null;
};

export default LoginPage;
