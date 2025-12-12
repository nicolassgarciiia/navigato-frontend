"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authFacade from "@/facade/authFacade";
import styles from "./login.module.css";
import Navbar from "@/components/Navbar";

// 1. Extraemos la lógica del formulario a un componente interno
function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para leer la URL (?email=...)

  // 2. EFECTO: Si hay un email en la URL, lo rellenamos automáticamente
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setCorreo(emailFromUrl);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Lógica limpia: Sin try/catch
    const res = await authFacade.login(correo, contraseña);

    if (res.ok) {
      // ÉXITO
      router.push("/home");
    } else {
      // ERROR (Contraseña mal, usuario no existe...)
      alert(res.error);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Inicia sesión</h1>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Correo"
            className={styles.input}
            value={correo} // Vinculado al estado
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            className={styles.input}
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />

          <button 
            type="submit" 
            className={styles.button} 
            disabled={loading}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 3. Componente Principal que envuelve el formulario en Suspense
export default function LoginPage() {
  return (
    <>
      <Navbar />
      {/* Suspense es necesario en Next.js cuando usamos useSearchParams */}
      <Suspense fallback={<div className={styles.container}>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </>
  );
}