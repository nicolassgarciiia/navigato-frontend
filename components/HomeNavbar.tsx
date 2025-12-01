"use client";

import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade";
import styles from "./HomeNavbar.module.css";

export default function HomeNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await authFacade.logout();
    router.push("/");
  };

  return (
    <header className={styles.navbar}>
      <h1 className={styles.title}>Navigato</h1>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Cerrar sesión
      </button>
    </header>
  );
}
