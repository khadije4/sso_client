import { useState, useCallback } from 'react';
import api from '../api/client';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (method === 'get') response = await api.get(url, config);
      else if (method === 'post') response = await api.post(url, data, config);
      else if (method === 'put') response = await api.put(url, data, config);
      else if (method === 'patch') response = await api.patch(url, data, config);
      else if (method === 'delete') response = await api.delete(url, config);
      else throw new Error(`Méthode ${method} non supportée`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
};