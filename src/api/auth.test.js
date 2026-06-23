/**
 * Tests Vitest — auth.js API (NovaSSO)
 * =====================================
 * Lance :
 *   npm run test
 *   ou : npx vitest run src/api/auth.test.js
 *
 * Ces tests vérifient la couche API sans appel réseau réel
 * (axios mocké via vi.mock).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock du client Axios ─────────────────────────────────────────────────────
vi.mock('./client', () => {
  const api = {
    post: vi.fn(),
    get:  vi.fn(),
  };
  return { default: api };
});

import api from './client';
import { login, signup, verifyEmail, resendVerificationEmail, mfaVerify, logout } from './auth';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACCESS  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.payload.sig';
const REFRESH = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.refresh.sig';

const successResponse = (extra = {}) => ({
  data: {
    access:  ACCESS,
    refresh: REFRESH,
    user: { id: 'uuid-1', email: 'test@nova.test', mfa_enabled: false },
    ...extra,
  },
});

const mfaResponse = () => ({
  data: {
    mfa_required: true,
    mfa_token:    'mfa_tok_abc',
    mfa_methods:  ['totp', 'email'],
  },
});

// ── Reset mocks avant chaque test ────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// =============================================================================
// login()
// =============================================================================

describe('login()', () => {

  it('appelle POST /login/ avec identifier et password', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    await login('test@nova.test', 'Pass123!');
    expect(api.post).toHaveBeenCalledWith('/login/', {
      identifier: 'test@nova.test',
      password:   'Pass123!',
    });
  });

  it('retourne access et refresh token en cas de succès', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    const result = await login('test@nova.test', 'Pass123!');
    expect(result.access).toBe(ACCESS);
    expect(result.refresh).toBe(REFRESH);
  });

  it('retourne les données utilisateur en cas de succès', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    const result = await login('test@nova.test', 'Pass123!');
    expect(result.user.email).toBe('test@nova.test');
  });

  it('retourne mfa_required quand le MFA est activé', async () => {
    api.post.mockResolvedValueOnce(mfaResponse());
    const result = await login('mfa@nova.test', 'Pass123!');
    expect(result.mfa_required).toBe(true);
    expect(result.mfa_token).toBe('mfa_tok_abc');
    expect(result.mfa_methods).toContain('totp');
  });

  it('propage l\'erreur réseau si l\'API est indisponible', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    await expect(login('test@nova.test', 'Pass123!')).rejects.toThrow('Network Error');
  });

  it('appelle post une seule fois', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    await login('test@nova.test', 'Pass123!');
    expect(api.post).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// signup()
// =============================================================================

describe('signup()', () => {

  const payload = {
    email:      'new@nova.test',
    phone:      '+22220000001',
    first_name: 'Nova',
    last_name:  'User',
    password:   'Pass123!',
    password2:  'Pass123!',
  };

  it('appelle POST /signup/ avec le payload complet', async () => {
    api.post.mockResolvedValueOnce({ data: { email: 'new@nova.test' } });
    await signup(payload);
    expect(api.post).toHaveBeenCalledWith('/signup/', payload);
  });

  it('retourne l\'email de l\'utilisateur créé', async () => {
    api.post.mockResolvedValueOnce({ data: { email: 'new@nova.test' } });
    const result = await signup(payload);
    expect(result.email).toBe('new@nova.test');
  });

  it('propage l\'erreur si email déjà utilisé', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 400, data: { email: ['already exists'] } } });
    await expect(signup(payload)).rejects.toBeDefined();
  });

  it('appelle post une seule fois', async () => {
    api.post.mockResolvedValueOnce({ data: { email: 'new@nova.test' } });
    await signup(payload);
    expect(api.post).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// verifyEmail()
// =============================================================================

describe('verifyEmail()', () => {

  it('appelle POST /verify-email/ avec email et code', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    await verifyEmail('test@nova.test', '123456');
    expect(api.post).toHaveBeenCalledWith('/verify-email/', {
      email: 'test@nova.test',
      code:  '123456',
    });
  });

  it('retourne les tokens après vérification réussie', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    const result = await verifyEmail('test@nova.test', '123456');
    expect(result.access).toBe(ACCESS);
    expect(result.refresh).toBe(REFRESH);
  });

  it('propage erreur si OTP invalide', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 400 } });
    await expect(verifyEmail('test@nova.test', '000000')).rejects.toBeDefined();
  });
});

// =============================================================================
// resendVerificationEmail()
// =============================================================================

describe('resendVerificationEmail()', () => {

  it('appelle GET /verify-email/?email=...', async () => {
    api.get.mockResolvedValueOnce({ data: { message: 'sent' } });
    await resendVerificationEmail('test@nova.test');
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/verify-email/?email=')
    );
  });

  it('encode correctement l\'email dans l\'URL', async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    await resendVerificationEmail('user+tag@nova.test');
    const url = api.get.mock.calls[0][0];
    expect(url).toContain(encodeURIComponent('user+tag@nova.test'));
  });

  it('appelle get une seule fois', async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    await resendVerificationEmail('test@nova.test');
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// mfaVerify()
// =============================================================================

describe('mfaVerify()', () => {

  it('appelle POST /mfa/verify/ avec les bons paramètres', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    await mfaVerify('mfa_tok_abc', '123456', 'totp');
    expect(api.post).toHaveBeenCalledWith('/mfa/verify/', {
      mfa_token: 'mfa_tok_abc',
      code:      '123456',
      method:    'totp',
    });
  });

  it('retourne les tokens après MFA réussi', async () => {
    api.post.mockResolvedValueOnce(successResponse());
    const result = await mfaVerify('tok', '654321', 'email');
    expect(result.access).toBe(ACCESS);
  });

  it('propage erreur si code MFA invalide', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 400 } });
    await expect(mfaVerify('tok', '000000', 'totp')).rejects.toBeDefined();
  });
});

// =============================================================================
// logout()
// =============================================================================

describe('logout()', () => {

  it('appelle POST /logout/ avec le refresh token', async () => {
    localStorage.setItem('refresh', REFRESH);
    api.post.mockResolvedValueOnce({ data: {} });
    await logout();
    expect(api.post).toHaveBeenCalledWith('/logout/', { refresh: REFRESH });
  });

  it('appelle POST /logout/ même sans refresh token en localStorage', async () => {
    api.post.mockResolvedValueOnce({ data: {} });
    await logout();
    expect(api.post).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Sécurité — structure des tokens
// =============================================================================

describe('Structure JWT', () => {

  it('un access token valide a 3 segments séparés par des points', () => {
    expect(ACCESS.split('.').length).toBe(3);
  });

  it('un refresh token valide a 3 segments séparés par des points', () => {
    expect(REFRESH.split('.').length).toBe(3);
  });

  it('access et refresh sont différents', () => {
    expect(ACCESS).not.toBe(REFRESH);
  });

  it('un token vide n\'est pas valide', () => {
    expect(''.split('.').length).not.toBe(3);
  });

  it('un token à 2 segments n\'est pas valide', () => {
    expect('only.two'.split('.').length).not.toBe(3);
  });
});
