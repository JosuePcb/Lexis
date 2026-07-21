import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Algo salió mal al iniciar sesión.");
      }

      // Guardar sesión en contexto y redirigir
      login(data.token, data.user);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[var(--color-card)] p-8 border border-[var(--color-secondary)] rounded-lg shadow-sm">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[var(--color-primary)]">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-primary)] opacity-80">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-sm text-red-500 rounded-r-md">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-[var(--color-primary)] mb-1">
                Correo Electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--color-secondary)] bg-[var(--color-bg)] text-[var(--color-primary)] placeholder-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent sm:text-sm"
                placeholder="ejemplo@lexis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-primary)] mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[var(--color-secondary)] bg-[var(--color-bg)] text-[var(--color-primary)] placeholder-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-accent)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] disabled:opacity-50 cursor-pointer transition-opacity"
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
