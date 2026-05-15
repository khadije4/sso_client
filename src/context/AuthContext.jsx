import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../utils/tokenStorage';
import api from './../api/client';

const AuthContext = createContext();

// Where to send a freshly-authenticated user when the caller didn't override
// the redirect. The client portal handles its own post-login routing, so this
// is purely a fallback for code paths that don't pass redirectAuto=false.
const POST_LOGIN_FALLBACK = '/client/select';
const POST_LOGOUT_PATH = '/client/login';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const res = await api.get('/user/me/');
          setUser(res.data);
        } catch (err) {
          console.error('Erreur chargement utilisateur', err);
          clearTokens();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  /**
   * Authenticate the user.
   *
   * @param {string} identifier  Email or phone.
   * @param {string} password
   * @param {boolean} redirectAuto  When true (default), navigate to the
   *   POST_LOGIN_FALLBACK on success. When false, the caller is responsible
   *   for routing — used by ClientLoginPage which makes a (identity, clients)
   *   decision before sending the user anywhere.
   */
  const login = async (identifier, password, redirectAuto = true) => {
    const response = await authApi.login(identifier, password);
    // Two possible field names depending on backend response shape.
    if (response.mfa_required || response.mfaRequired) {
      const mfaToken = response.mfa_token || response.mfaToken;
      sessionStorage.setItem('mfa_token', mfaToken);
      sessionStorage.setItem('mfa_methods', JSON.stringify(response.mfa_methods || response.mfaMethods || []));
      return {
        mfaRequired: true,
        mfaToken,
        mfaMethods: response.mfa_methods || response.mfaMethods || [],
      };
    }
    setTokens(response.access, response.refresh);
    setUser(response.user);
    if (redirectAuto) navigate(POST_LOGIN_FALLBACK);
    return { success: true, user: response.user };
  };

  const mfaVerify = async (mfaToken, code, method, redirectAuto = true) => {
    const response = await authApi.mfaVerify(mfaToken, code, method);
    setTokens(response.access, response.refresh);
    setUser(response.user);
    sessionStorage.removeItem('mfa_token');
    sessionStorage.removeItem('mfa_methods');
    if (redirectAuto) navigate(POST_LOGIN_FALLBACK);
    return { success: true, user: response.user };
  };

  const logout = async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try { await authApi.logout(refresh); } catch (e) { /* ignore */ }
    }
    clearTokens();
    setUser(null);
    navigate(POST_LOGOUT_PATH);
  };

  const biometricLogin = async (identifier, imageFile, redirectAuto = true) => {
    const formData = new FormData();
    formData.append('identifier', identifier);
    formData.append('image', imageFile);
    const response = await api.post('/biometric/login/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.access) {
      setTokens(response.data.access, response.data.refresh);
      const userRes = await api.get('/user/me/');
      setUser(userRes.data);
      if (redirectAuto) navigate(POST_LOGIN_FALLBACK);
      return { success: true, user: userRes.data };
    }
    throw new Error('No access token');
  };

  const value = {
    user,
    loading,
    login,
    mfaVerify,
    logout,
    biometricLogin,
    isAuthenticated: !!getAccessToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
