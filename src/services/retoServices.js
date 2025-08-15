// src/services/retoService.js
import httpClient from './httpClient';

const ENDPOINT = '/retos/'; // httpClient.baseURL ya incluye /api/v1

export const retoService = {
  getAll: async (params = {}) => {
    const res = await httpClient.get(ENDPOINT, { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await httpClient.get(`${ENDPOINT}${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await httpClient.post(ENDPOINT, payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await httpClient.put(`${ENDPOINT}${id}`, payload);
    return res.data;
  },
  delete: async (id) => {
    const res = await httpClient.delete(`${ENDPOINT}${id}`);
    return res.data;
  },
  deactivate: async (id) => {
    // Si el backend no tiene endpoint específico de "desactivar", usamos delete o update con activo=false
    const res = await httpClient.put(`${ENDPOINT}${id}`, { activo: false });
    return res.data;
  }
};
