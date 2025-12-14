"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade";
import styles from "./HomeNavbar.module.css";

// Añadimos la prop para controlar el Sidebar desde aquí
interface HomeNavbarProps {
  onToggleSidebar: () => void;
}

export default function HomeNavbar({ onToggleSidebar }: HomeNavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = authFacade.getUser();
    setUser(currentUser);

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authFacade.logout();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!user?.correo) return;
    const confirm = window.confirm(
      "¿Estás seguro de que quieres eliminar tu cuenta? Se borrarán todos tus datos."
    );
    if (confirm) {
      const res = await authFacade.deleteAccount(user.correo);
      if (!res.ok) alert("Error: " + res.error);
    }
  };

  return (
    <nav className={styles.navbar}>
      {/* SECCIÓN IZQUIERDA: HAMBURGUESA */}
      <div className={styles.leftSection}>
        <button className={styles.hamburgerBtn} onClick={onToggleSidebar}>
          ☰
        </button>
      </div>

      {/* SECCIÓN CENTRAL: LOGO */}
      <div className={styles.logo} onClick={() => router.push("/home")}>
        <img
          src="/transparente.png"
          alt="Navigato"
          className={styles.logoImage}
        />
      </div>

      {/* SECCIÓN DERECHA: USUARIO (Tu lógica intacta) */}
      {user && (
        <div className={styles.userSection} ref={menuRef}>
          <button
            className={styles.avatarButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={styles.userInfoPreview}>
              <span className={styles.userNamePreview}>{user.nombre}</span>
            </div>

            <div className={styles.avatarCircle}>
              {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
            </div>

            <svg className={styles.chevron} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isOpen && (
            <div className={styles.dropdown}>
              <button className={styles.menuItem} onClick={handleLogout}>
                Cerrar sesión
              </button>
              <div className={styles.divider}></div>
              <button
                className={`${styles.menuItem} ${styles.deleteItem}`}
                onClick={handleDeleteAccount}
              >
                Eliminar cuenta
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}