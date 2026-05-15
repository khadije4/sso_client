import api from './client';

export const getAuthorizedApps = () => api.get('/user/apps/').then(res => res.data);
export const revokeApp = (appId) => api.delete(`/user/apps/${appId}/revoke/`);
export const getDevices = () => api.get('/user/devices/').then(res => res.data);
export const deleteDevice = (deviceId) => api.delete(`/user/devices/${deviceId}/`);
export const getActivity = () => api.get('/user/activity/').then(res => res.data);