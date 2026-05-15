import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const BiometricLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Use location state to pre‑fill identifier, but allow user to change it
  const [identifier, setIdentifier] = useState(location.state?.identifier || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreview(dataUrl);
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => setImage(blob));
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const { biometricLogin } = useAuth();

const handleBiometricLogin = async (e) => {
  e.preventDefault();
  if (!identifier || !image) {
    setError('Please provide identifier and capture/upload a selfie');
    return;
  }
  setLoading(true);
  setError('');
  try {
    await biometricLogin(identifier, image);
    // navigation handled inside context
  } catch (err) {
    setError(err.response?.data?.error || 'Biometric login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Biometric Login</h2>
      <form onSubmit={handleBiometricLogin}>
        <input
          type="text"
          placeholder="Email or Phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        {!preview && (
          <div>
            <button type="button" onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
              Take Selfie
            </button>
            <label className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
        {stream && (
          <div className="mt-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
            <button type="button" onClick={capturePhoto} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
              Capture
            </button>
          </div>
        )}
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Selfie" className="w-full rounded" />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setImage(null);
              }}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              Retake
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <button
          type="submit"
          disabled={!identifier || !image || loading}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Login with Face'}
        </button>
        {error && <div className="mt-2 text-red-600">{error}</div>}
      </form>
    </div>
  );
};

export default BiometricLogin;