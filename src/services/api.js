// src/services/api.js
// Asegúrate que esta URL apunte al deploy correcto
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://altus-api-production.up.railway.app";

/**
 * handleResponse: parsing tolerante y normalización de errores.
 * Si recibe 401 hace limpieza y redirección compatible con HashRouter.
 */
export async function handleResponse(response) {
  const ct = (response.headers && response.headers.get ? (response.headers.get("content-type") || "") : "").toLowerCase();
  let data = null;
  let text = null;

  try {
    if (ct.includes("application/json") || ct.includes("application/problem+json")) {
      data = await response.json().catch(() => null);
    } else {
      text = await response.text().catch(() => null);
    }
  } catch {
    try {
      text = await response.text().catch(() => null);
    } catch {}
  }

  if (response.ok) return data ?? (text ?? null);

  const extractMessage = (payload) => {
    if (!payload) return null;
    if (typeof payload === "string") return payload;
    if (payload.detail) {
      if (typeof payload.detail === "string") return payload.detail;
      if (Array.isArray(payload.detail)) {
        return payload.detail.map((d) => d?.msg || d?.message || JSON.stringify(d)).join(" | ");
      }
    }
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (payload.errors && typeof payload.errors === "object") {
      try {
        const parts = [];
        for (const k of Object.keys(payload.errors)) {
          const val = payload.errors[k];
          if (Array.isArray(val)) parts.push(...val);
          else if (typeof val === "string") parts.push(`${k}: ${val}`);
          else parts.push(JSON.stringify(val));
        }
        if (parts.length) return parts.join(" | ");
      } catch {}
    }
    try {
      const keys = Object.keys(payload);
      if (keys.length === 1 && typeof payload[keys[0]] === "string") return payload[keys[0]];
    } catch {}
    return null;
  };

  const payload = data ?? text ?? null;
  const serverMsg = extractMessage(data) || extractMessage(text);

  if (response.status === 401) {
    try { localStorage.removeItem("authToken"); localStorage.removeItem("userInfo"); } catch {}
    if (typeof window !== "undefined") {
      try {
        const currentUrl = window.location.href || "";
        const alreadyOnLogin = currentUrl.includes("#/login") || currentUrl.endsWith("/login");
        if (!alreadyOnLogin) {
          const loginHashUrl = `${window.location.origin}${window.location.pathname}#/login`;
          window.location.replace(loginHashUrl);
        }
      } catch {}
    }
    const err401 = new Error(serverMsg || "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
    err401.status = 401;
    err401.data = payload;
    throw err401;
  }

  const defaultMessages = {
    400: "Solicitud inválida.",
    403: "No tienes permisos para realizar esta acción.",
    404: "El recurso solicitado no fue encontrado.",
    409: "Conflicto con datos existentes.",
    422: "Datos inválidos. Revisa los campos.",
    500: "Error interno del servidor. Intenta más tarde.",
  };

  const fallback = defaultMessages[response.status] || `Error ${response.status}: ${response.statusText || "Desconocido"}`;
  const finalMessage = serverMsg || fallback;

  const err = new Error(finalMessage);
  err.status = response.status;
  err.data = payload;
  throw err;
}
