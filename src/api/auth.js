import api from './client';

export const login = (identifier, password) =>
  api.post('/login/', { identifier, password }).then(res => res.data);

export const mfaVerify = (mfaToken, code, method) =>
  api.post('/mfa/verify/', { mfa_token: mfaToken, code, method }).then(res => res.data);

export const logout = () => {
  const refresh = localStorage.getItem('refresh');
  return api.post('/logout/', { refresh });
};

// Registers a brand new end user. The backend creates the user, sends an
// email verification code, and returns 201 with the email field populated.
// The user CANNOT log in until they enter the code on /verify-email.
export const signup = (payload) =>
  api.post('/signup/', payload).then(res => res.data);

// Verify the email-verification OTP that was sent to the new user. On
// success the backend returns {access, refresh, user} so the caller can
// log the user in immediately.
export const verifyEmail = (email, code) =>
  api.post('/verify-email/', { email, code }).then(res => res.data);

// Re-send the email-verification code if it expired or got lost.
export const resendVerificationEmail = (email) =>
  api.get(`/verify-email/?email=${encodeURIComponent(email)}`).then(res => res.data);
