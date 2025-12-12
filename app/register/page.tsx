"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade";
import styles from "./register.module.css";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contraseña: "",
    repetirContraseña: "",
    aceptaPoliticaPrivacidad: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true);

    const res = await authFacade.register(form);

    setLoading(false);

    if (res.ok) {
      alert(
        "¡Cuenta creada con éxito!\n\n" +
        "Hemos enviado un enlace de confirmación a tu correo.\n" +
        "Por favor, verifícalo antes de iniciar sesión."
      );
      
      // Redirigimos al Login pasando el email para autocompletarlo
      router.push(`/login?email=${encodeURIComponent(form.correo)}`);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Regístrate</h1>

          <form onSubmit={handleRegister} className={styles.formColumn}>
            <input 
              name="nombre" 
              className={styles.input} 
              placeholder="Nombre" 
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input 
              name="apellidos" 
              className={styles.input} 
              placeholder="Apellidos" 
              value={form.apellidos}
              onChange={handleChange}
              required
            />
            <input 
              name="correo" 
              type="email"
              className={styles.input} 
              placeholder="Correo" 
              value={form.correo}
              onChange={handleChange}
              required
            />
            <input 
              name="contraseña" 
              type="password" 
              className={styles.input} 
              placeholder="Contraseña" 
              value={form.contraseña}
              onChange={handleChange}
              required
            />
            <input 
              name="repetirContraseña" 
              type="password" 
              className={styles.input} 
              placeholder="Repetir contraseña" 
              value={form.repetirContraseña}
              onChange={handleChange}
              required
            />

            <label className={styles.checkboxContainer}>
              <input 
                name="aceptaPoliticaPrivacidad" 
                type="checkbox" 
                checked={form.aceptaPoliticaPrivacidad}
                onChange={handleChange}
                required
              />
              Acepto la política de privacidad
            </label>

            <button 
              type="submit" 
              className={styles.button} 
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}