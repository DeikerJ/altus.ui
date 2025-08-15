// services/appointmentService.js
import { API_BASE_URL, handleResponse } from "./api.js";

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeOne = (s) => {
  if (!s) return s;
  const id = s.id ?? s._id ?? s._id?.$oid ?? s._id?.oid;
  return { ...s, id };
};

const normalizeList = (arr) => (Array.isArray(arr) ? arr.map(normalizeOne) : []);

export const appointmentService = {
  // Soporta respuesta como array o como objeto { appointments, total, ... }
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      const data = await handleResponse(res);

      if (Array.isArray(data)) {
        return normalizeList(data);
      }
      if (Array.isArray(data?.appointments)) {
        return { ...data, appointments: normalizeList(data.appointments) };
      }
      // fallback
      return [];
    } catch (error) {
      console.error("Error al obtener las citas:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      const data = await handleResponse(res);
      return normalizeOne(data);
    } catch (error) {
      console.error("Error al obtener la cita:", error);
      throw error;
    }
  },

  create: async (appointment) => {
    try {
      // Solo enviamos lo que el backend espera:
      // - siempre: date_appointment, comment
      // - opcional (si admin): user_id
      const payload = {
        date_appointment: appointment.date_appointment,
        comment: appointment.comment,
        ...(appointment.user_id ? { user_id: appointment.user_id } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(res);
      return normalizeOne(data);
    } catch (error) {
      console.error("Error al crear la cita:", error);
      throw error;
    }
  },

  update: async (id, appointment) => {
    try {
      // Tu backend actualiza únicamente campos de la cita (excluye user_id)
      const payload = {
        date_appointment: appointment.date_appointment,
        comment: appointment.comment,
      };

      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "PUT", // usa PATCH si tu API lo requiere
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(res);
      return normalizeOne(data);
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      throw error;
    }
  },

  // Nombre alineado con tu componente (AppointmentList usa .disable)
  disable: async (id) => {
    try {
      // Tu endpoint hace baja lógica con DELETE /appointments/{id}
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      // Suele devolver { message: "Appointment successfully disabled" }
      return await handleResponse(res);
    } catch (error) {
      console.error("Error al desactivar la cita:", error);
      throw error;
    }
  },
};
