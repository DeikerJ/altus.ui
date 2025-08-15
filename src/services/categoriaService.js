// src/services/categoriaService.js
import axios from "axios";

const API_BASE = "https://altus-api-production.up.railway.app/api/v1/categorias";

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});

// Obtener todas las categorías (colección) - usar slash final
export const getCategorias = async (token) => {
  // Si token existe, enviarlo en headers; si no, llamar sin Authorization
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axios.get(`${API_BASE}/`, config);
  return response.data;
};

// Crear categoría - usar slash final
export const createCategoria = async (categoriaData, token) => {
  const response = await axios.post(`${API_BASE}/`, categoriaData, authHeaders(token));
  return response.data;
};

// Actualizar categoría (PUT al detalle SIN slash final, según router FastAPI)
export const updateCategoria = async (id, categoriaData, token) => {
  const response = await axios.put(`${API_BASE}/${id}`, categoriaData, authHeaders(token));
  return response.data;
};

// Eliminar/desactivar categoría (DELETE detalle SIN slash final)
export const deleteCategoria = async (id, token) => {
  const response = await axios.delete(`${API_BASE}/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  return response.data;
};
