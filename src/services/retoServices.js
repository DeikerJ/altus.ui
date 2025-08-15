// src/services/retoService.js
import httpClient from './httpClient';

const ENDPOINT = '/retos/'; // httpClient.baseURL ya incluye /api/v1

export const retoService = {
  // Obtener todos los retos
  getAll: async (params = {}) => {
    try {
      const res = await httpClient.get(ENDPOINT, { params });
      return res.data; // Retorna los datos de los retos
    } catch (error) {
      console.error('Error al obtener los retos:', error);
      throw error; // Lanza el error para que el componente lo maneje
    }
  },

  // Obtener un reto por su ID
  getById: async (id) => {
    try {
      const res = await httpClient.get(`${ENDPOINT}${id}`);
      return res.data; // Retorna los datos del reto específico
    } catch (error) {
      console.error(`Error al obtener el reto con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo reto
  create: async (payload) => {
    try {
      const res = await httpClient.post(ENDPOINT, payload);
      return res.data; // Retorna los datos del reto creado
    } catch (error) {
      console.error('Error al crear un reto:', error);
      throw error;
    }
  },

  // Actualizar un reto por su ID
  update: async (id, payload) => {
    try {
      const res = await httpClient.put(`${ENDPOINT}${id}`, payload);
      return res.data; // Retorna los datos del reto actualizado
    } catch (error) {
      console.error(`Error al actualizar el reto con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un reto por su ID
  delete: async (id) => {
    try {
      const res = await httpClient.delete(`${ENDPOINT}${id}`);
      return res.data; // Retorna la respuesta de la eliminación
    } catch (error) {
      console.error(`Error al eliminar el reto con ID ${id}:`, error);
      throw error;
    }
  },

  // Desactivar un reto
  deactivate: async (id) => {
    try {
      const res = await httpClient.put(`${ENDPOINT}${id}`, { activo: false });
      return res.data; // Retorna los datos del reto desactivado
    } catch (error) {
      console.error(`Error al desactivar el reto con ID ${id}:`, error);
      throw error;
    }
  }
};
