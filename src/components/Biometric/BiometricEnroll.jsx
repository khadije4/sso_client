import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const BiometricEnroll = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera: ' + err.message);
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreview(dataUrl);
    // Convert dataURL to blob
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => setImage(blob));
    // Stop camera after capture
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
      // Stop camera if running
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleEnroll = async () => {
    if (!image) {
      setError('Please capture or upload a selfie');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('image', image);
    try {
      const response = await api.post('/biometric/enroll/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Enroll Face for Biometric Login</h2>
      {!preview && (
        <div>
          <button
            onClick={startCamera}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Start Camera
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
          <button
            onClick={capturePhoto}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Capture
          </button>
        </div>
      )}
      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="w-full rounded" />
          <button
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
        onClick={handleEnroll}
        disabled={!image || loading}
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Enrolling...' : 'Enroll Face'}
      </button>
      {message && <div className="mt-2 text-green-600">{message}</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
};

export default BiometricEnroll;