// src/services/authService.js
import { API_BASE_URL, handleResponse } from "./api.js";

/**
 * authService: login -> POST /login
 *              register -> POST /api/v1/usuarios/
 */

export const authService = {
  login: async (email, password) => {
    try {
      const url = `${API_BASE_URL.replace(/\/$/, "")}/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleResponse(response);

      const token = data?.idToken || data?.token || null;
      if (token) {
        try { localStorage.setItem("authToken", token); } catch {}
        try {
          const userInfo = decodeToken(token);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
        } catch {}
      }

      return data;
    } catch (err) {
      console.error("Error en login:", err);
      throw err;
    }
  },

  register: async (name, lastname, email, password) => {
    // validación local ligera para ahorrar requests innecesarios
    if (!validarPassword(password)) {
      throw new Error("La contraseña debe tener entre 8 y 64 caracteres, incluir al menos una mayúscula, un número y un carácter especial.");
    }

    // Ruta EXACTA según tu main.py
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/v1/usuarios/`;

    // El modelo Usuario espera name y lastname (según lo pegado)
    const payload = { name, lastname, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await handleResponse(response);
      return data;
    } catch (err) {
      // log detallado para debugging
      console.error("Error en register - url:", url, "payload:", payload, "error:", err);
      throw err;
    }
  },

  logout: () => {
    try { localStorage.removeItem("authToken"); localStorage.removeItem("userInfo"); } catch {}
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;
    try {
      const u = decodeToken(token);
      return u.exp ? u.exp * 1000 > Date.now() : true;
    } catch { return false; }
  },

  getCurrentUser: () => {
    try { const raw = localStorage.getItem("userInfo"); return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  getToken: () => localStorage.getItem("authToken"),
};

const validarPassword = (password) => {
  if (typeof password !== "string") return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>[\]\\\/`~_\-+=;:$%]/.test(password);
  const len = password.length >= 8 && password.length <= 64;
  return hasUpper && hasNumber && hasSpecial && len;
};

const decodeToken = (token) => {
  try {
    if (!token || typeof token !== "string") throw new Error("Token inválido");
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("Token mal formado");
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("Error decodificando token:", e);
    throw new Error("Token inválido");
  }
};

export default authService;
