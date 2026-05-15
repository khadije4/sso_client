import api from './client';

export const enrollBiometric = (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post('/biometric/enroll/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const biometricLogin = (identifier, imageFile) => {
  const formData = new FormData();
  formData.append('identifier', identifier);
  formData.append('image', imageFile);
  return api.post('/biometric/login/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};