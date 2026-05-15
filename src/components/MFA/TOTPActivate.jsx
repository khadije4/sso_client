import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const TOTPActivate = ({ onSuccess }) => {
  const [step, setStep] = useState('loading'); // loading, qrcode, verify
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const response = await api.get('/mfa/totp/enable/');
      setSecret(response.data.secret);
      setQrCode(response.data.qr_code);
      setStep('qrcode');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get QR code');
      setStep('error');
    }
  };

  const verifyAndActivate = async () => {
    if (!code) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Send secret along with the code
      await api.post('/mfa/totp/enable/', { secret, code });
      setMessage('TOTP successfully activated!');
      setStep('done');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'loading') return <div>Loading...</div>;
  if (step === 'error') return <div className="text-red-600">{error}</div>;
  if (step === 'done') return <div className="text-green-600">{message}</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Activate TOTP</h2>
      {step === 'qrcode' && (
        <>
          <p className="mb-2">Scan this QR code with Google Authenticator or any TOTP app:</p>
          {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />}
          <p className="mb-2">Or enter this secret manually: <code className="bg-gray-100 p-1">{secret}</code></p>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={verifyAndActivate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Activate'}
          </button>
          {error && <div className="mt-2 text-red-600">{error}</div>}
        </>
      )}
    </div>
  );
};

export default TOTPActivate;