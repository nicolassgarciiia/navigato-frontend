"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contraseña: "",
    repetirContraseña: "",
    aceptaPoliticaPrivacidad: false,
  });

  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleRegister = async () => {
    const res = await authFacade.register(form);

    if (res.ok) {
      alert("Usuario registrado correctamente");
      router.push("/home");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Regístrate</h1>

        <input name="nombre" className={styles.input} placeholder="Nombre" onChange={handleChange}/>
        <input name="apellidos" className={styles.input} placeholder="Apellidos" onChange={handleChange}/>
        <input name="correo" className={styles.input} placeholder="Correo" onChange={handleChange}/>
        <input name="contraseña" type="password" className={styles.input} placeholder="Contraseña" onChange={handleChange}/>
        <input name="repetirContraseña" type="password" className={styles.input} placeholder="Repetir contraseña" onChange={handleChange}/>

        <label className={styles.checkboxContainer}>
          <input name="aceptaPoliticaPrivacidad" type="checkbox" onChange={handleChange}/>
          Acepto la política de privacidad
        </label>

        <button className={styles.button} onClick={handleRegister}>Registrarse</button>
      </div>
    </div>
  );
}
