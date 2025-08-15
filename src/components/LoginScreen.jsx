import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const parseErrorMessage = (err) => {
    if (!err) return "Error al iniciar sesión. Intenta nuevamente.";
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    if (err.detail) return err.detail;
    if (err.response && err.response.data) {
      const d = err.response.data;
      if (d.detail) return d.detail;
      if (d.message) return d.message;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "Error desconocido";
    }
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    // Validaciones básicas
    if (!email.trim()) {
      setError("El email es requerido");
      setIsSubmitting(false);
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Por favor ingresa un email válido");
      setIsSubmitting(false);
      return;
    }
    if (!password.trim()) {
      setError("La contraseña es requerida");
      setIsSubmitting(false);
      return;
    }

    try {
      // No loguear la contraseña por seguridad
      // console.log("Intentando login con:", { email });
      const result = await login(email, password);
      // Dependiendo de cómo implementes login: puede devolver token o lanzar error
      if (result) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Credenciales incorrectas o respuesta inesperada del servidor.");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2b39] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <img src="/logo.png" alt="Altus Logo" className="mb-4 h-32" />

      {/* Card */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 text-center mb-6">Iniciar Sesión</h1>

        {/* mensajes accesibles */}
        <div aria-live="polite" className="min-h-[2rem]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form className="space-y-4" noValidate onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          <div>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#c3cccd] text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-[#c3cccd] hover:text-gray-400">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
