"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade";
import PreferencesModal from "@/components/preferences/PreferencesModal";
import styles from "./HomeNavbar.module.css";

interface HomeNavbarProps {
  onToggleSidebar: () => void;
}

export default function HomeNavbar({ onToggleSidebar }: HomeNavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
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
      "¿Estás seguro de que quieres eliminar tu cuenta?"
    );
    if (confirm) {
      const res = await authFacade.deleteAccount(user.correo);
      if (!res.ok) alert("Error: " + res.error);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* IZQUIERDA */}
        <div className={styles.leftSection}>
          <button className={styles.hamburgerBtn} onClick={onToggleSidebar}>
            ☰
          </button>
        </div>

        {/* CENTRO */}
        <div className={styles.logo} onClick={() => router.push("/home")}>
          <img
            src="/transparente.png"
            alt="Navigato"
            className={styles.logoImage}
          />
        </div>

        {/* DERECHA */}
        {user && (
          <div className={styles.userSection} ref={menuRef}>
            <button
              className={styles.avatarButton}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={styles.userNamePreview}>{user.nombre}</span>
              <div className={styles.avatarCircle}>
                {user.nombre?.charAt(0).toUpperCase()}
              </div>
            </button>

            {isOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setShowPreferences(true);
                    setIsOpen(false);
                  }}
                >
                  Modificar preferencias
                </button>

                <div className={styles.divider} />

                <button className={styles.menuItem} onClick={handleLogout}>
                  Cerrar sesión
                </button>

                <div className={styles.divider} />

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

      {/* MODAL DE PREFERENCIAS */}
      {showPreferences && (
        <PreferencesModal onClose={() => setShowPreferences(false)} />
      )}
    </>
  );
}
