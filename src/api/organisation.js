import api from './client';

// ---- Clients (organisations) ----
export const getClients = () => api.get('/clients/').then(res => res.data);
export const getClient = (id) => api.get(`/clients/${id}/`).then(res => res.data);
export const updateClient = (id, data) => api.patch(`/clients/${id}/`, data).then(res => res.data);

// ---- OAuth2 Applications for a client ----
export const getClientApps = (clientId) => api.get(`/clients/${clientId}/apps/`).then(res => res.data);
export const createClientApp = (clientId, appData) =>
  api.post(`/clients/${clientId}/apps/`, appData).then(res => res.data);
export const updateClientApp = (clientId, appId, appData) =>
  api.put(`/clients/${clientId}/apps/${appId}/`, appData).then(res => res.data);
export const deleteClientApp = (clientId, appId) =>
  api.delete(`/clients/${clientId}/apps/${appId}/`).then(res => res.data);

// ---- Team management ----
export const getClientTeam = (clientId) => api.get(`/clients/${clientId}/team/`).then(res => res.data);
export const inviteTeamMember = (clientId, userId, role) =>
  api.post(`/clients/${clientId}/team/`, { user_id: userId, role }).then(res => res.data);

// ---- Statistics and plans ----
export const getClientStats = (clientId) => api.get(`/clients/${clientId}/stats/`).then(res => res.data);
export const getPlans = () => api.get('/plans/').then(res => res.data);
export const changeClientPlan = (clientId, planId) =>
  api.post(`/clients/${clientId}/change-plan/`, { plan_id: planId }).then(res => res.data);
