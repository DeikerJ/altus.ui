// src/services/retoCategoriaService.js
import httpClient from './httpClient';

const ENDPOINT = '/reto-categoria'; // cámbialo según tu API

// Obtener todas las relaciones
export const getAllRelations = () => {
  return httpClient.get(ENDPOINT);
};

// Obtener categorías de un reto específico
export const getCategoriasByReto = (retoId) => {
  return httpClient.get(`${ENDPOINT}/reto/${retoId}`);
};

// Obtener retos de una categoría específica
export const getRetosByCategoria = (categoriaId) => {
  return httpClient.get(`${ENDPOINT}/categoria/${categoriaId}`);
};

// Crear relación reto-categoría
export const addRelation = (retoId, categoriaId) => {
  return httpClient.post(ENDPOINT, { retoId, categoriaId });
};

// Eliminar relación reto-categoría
export const deleteRelation = (idRelacion) => {
  return httpClient.delete(`${ENDPOINT}/${idRelacion}`);
};
