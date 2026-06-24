import api from './client';

// ---- Clients (organisations) ----
export const getClients = () => api.get('/clients/').then(res => res.data);
export const getClient = (id) => api.get(`/clients/${id}/`).then(res => res.data);
export const updateClient = (id, data) => api.patch(`/clients/${id}/`, data).then(res => res.data);

// ---- OAuth2 Applications ----
export const getClientApps = (clientId) => api.get(`/clients/${clientId}/apps/`).then(res => res.data);
export const createClientApp = (clientId, appData) =>
  api.post(`/clients/${clientId}/apps/`, appData).then(res => res.data);
export const updateClientApp = (clientId, appId, appData) =>
  api.patch(`/clients/${clientId}/apps/${appId}/`, appData).then(res => res.data);
export const deleteClientApp = (clientId, appId) =>
  api.delete(`/clients/${clientId}/apps/${appId}/`).then(res => res.data);

// ---- Team management ----
export const getClientTeam = (clientId) => api.get(`/clients/${clientId}/team/`).then(res => res.data);
export const inviteTeamMember = (clientId, email, role) =>
  api.post(`/clients/${clientId}/team/`, { email, role }).then(res => res.data);
export const removeTeamMember = (clientId, userId) =>
  api.delete(`/clients/${clientId}/team/${userId}/`).then(res => res.data);

// ---- Statistics ----
export const getClientStats = (clientId, period = '30d') =>
  api.get(`/clients/${clientId}/stats/`, { params: { period } }).then(res => res.data);

// ---- Plans ----
export const getPlans = () => api.get('/plans/').then(res => res.data);
export const changeClientPlan = (clientId, planId) =>
  api.post(`/clients/${clientId}/change-plan/`, { plan_id: planId }).then(res => res.data);

// ---- Services ----
export const getClientServices = (clientId) =>
  api.get(`/clients/${clientId}/services/`).then(res => res.data);
export const subscribeService = (clientId, serviceId) =>
  api.post(`/clients/${clientId}/services/${serviceId}/subscribe/`).then(res => res.data);
export const unsubscribeService = (clientId, serviceId) =>
  api.delete(`/clients/${clientId}/services/${serviceId}/subscribe/`).then(res => res.data);

// ---- API Credentials ----
export const getApiCredentials = (clientId) =>
  api.get(`/clients/${clientId}/api-credentials/`).then(res => res.data);
export const regenerateApiKey = (clientId) =>
  api.post(`/clients/${clientId}/regenerate-api-key/`).then(res => res.data);

// ---- Settings ----
export const updateClientSettings = (clientId, data) =>
  api.patch(`/clients/${clientId}/settings/`, data).then(res => res.data);
