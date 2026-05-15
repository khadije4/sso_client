let accessToken = null;
let refreshToken = null;

export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  // Optionnel : stocker dans sessionStorage pour persistance entre rechargements
  if (access) sessionStorage.setItem('access_token', access);
  if (refresh) sessionStorage.setItem('refresh_token', refresh);
};

export const getAccessToken = () => accessToken || sessionStorage.getItem('access_token');
export const getRefreshToken = () => refreshToken || sessionStorage.getItem('refresh_token');

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

// Initialiser depuis sessionStorage au démarrage
const storedAccess = sessionStorage.getItem('access_token');
const storedRefresh = sessionStorage.getItem('refresh_token');
if (storedAccess && storedRefresh) {
  accessToken = storedAccess;
  refreshToken = storedRefresh;
}