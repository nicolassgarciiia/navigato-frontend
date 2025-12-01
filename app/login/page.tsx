"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade";
import styles from "./login.module.css";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await authFacade.login(correo, contraseña);

    if (res.ok) {
      alert("Sesión iniciada correctamente");
      router.push("/home");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Inicia sesión</h1>

        <input type="email" placeholder="Correo" className={styles.input} onChange={(e) => setCorreo(e.target.value)} />
        <input type="password" placeholder="Contraseña" className={styles.input} onChange={(e) => setContraseña(e.target.value)} />

        <button className={styles.button} onClick={handleLogin}>Iniciar sesión</button>
      </div>
    </div>
  );
}
