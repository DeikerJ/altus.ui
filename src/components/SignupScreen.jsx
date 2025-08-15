import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidEmail, validatePassword, getPasswordStrength } from "../utils/validators";

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const parseErrorMessage = (err) => {
    if (!err) return "Error al crear la cuenta. Intenta nuevamente.";
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

  const handleSignup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validaciones
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      setIsSubmitting(false);
      return;
    }
    if (!formData.lastname.trim()) {
      setError("El apellido es requerido");
      setIsSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      setIsSubmitting(false);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError("Por favor ingresa un email válido");
      setIsSubmitting(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(
        formData.name,
        formData.lastname,
        formData.email,
        formData.password
      );

      if (result) {
        setSuccess("¡Cuenta creada exitosamente! Redirigiendo al login...");
        setFormData({
          name: "",
          lastname: "",
          email: "",
          password: "",
          confirmPassword: ""
        });

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1300);
      } else {
        setError("No se pudo crear la cuenta. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      setError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2b39] flex flex-col items-center justify-center p-4">
      <img src="/logo.png" alt="Altus Logo" className="mb-4 h-32" />

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 text-center mb-6">Crear Cuenta</h1>

        <div aria-live="polite" className="min-h-[2rem]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                <span>{success}</span>
              </div>
            </div>
          )}
        </div>

        <form className="space-y-4" noValidate onSubmit={handleSignup}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
                placeholder="Juan"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
                placeholder="Pérez"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
              placeholder="usuario2@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
              placeholder="8-64 caracteres, 1 mayúscula, 1 número, 1 especial"
              autoComplete="new-password"
            />

            {formData.password && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Requisitos de contraseña:</div>
                <div className="space-y-1">
                  {(() => {
                    const strength = getPasswordStrength(formData.password);
                    return (
                      <>
                        <div className={`text-xs flex items-center ${strength.isValidLength ? "text-green-600" : "text-gray-400"}`}>
                          <span className="mr-1">{strength.isValidLength ? "✓" : "○"}</span>
                          8-64 caracteres
                        </div>
                        <div className={`text-xs flex items-center ${strength.hasUppercase ? "text-green-600" : "text-gray-400"}`}>
                          <span className="mr-1">{strength.hasUppercase ? "✓" : "○"}</span>
                          Al menos una mayúscula
                        </div>
                        <div className={`text-xs flex items-center ${strength.hasNumber ? "text-green-600" : "text-gray-400"}`}>
                          <span className="mr-1">{strength.hasNumber ? "✓" : "○"}</span>
                          Al menos un número
                        </div>
                        <div className={`text-xs flex items-center ${strength.hasSpecialChar ? "text-green-600" : "text-gray-400"}`}>
                          <span className="mr-1">{strength.hasSpecialChar ? "✓" : "○"}</span>
                          Carácter especial (@$!%*?&)
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3cccd]"
              placeholder="Confirma tu contraseña"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#c3cccd] text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-[#c3cccd] hover:text-gray-400">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
