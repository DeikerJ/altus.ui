// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // inicializamos desde localStorage si existe
    return localStorage.getItem("authToken") || null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const checkAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          }
          // aseguramos token desde localStorage o desde currentUser
          const saved = localStorage.getItem("authToken") || currentUser?.token || null;
          setToken(saved);
        }
      } catch (err) {
        console.error("checkAuth error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      await authService.login(email, password);
      const currentUser = authService.getCurrentUser();
      const savedToken = localStorage.getItem("authToken") || currentUser?.token || null;
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setToken(savedToken);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, lastname, email, password) => {
    try {
      setLoading(true);
      const result = await authService.register(name, lastname, email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  const validateToken = () => {
    // usamos el token del estado o de localStorage
    const t = token || localStorage.getItem("authToken");
    if (!t) {
      logout();
      return false;
    }
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp < currentTime) {
        logout();
        return false;
      }
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // función pública para obtener token (ya validada por prioridad)
  const getToken = () => {
    return token || user?.token || localStorage.getItem("authToken") || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        validateToken,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
