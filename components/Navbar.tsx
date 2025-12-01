"use client";
import Link from "next/link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>Navigato</Link>

      <div className={styles.buttons}>
        <Link href="/login" className={styles.login}>Inicia sesión</Link>
        <Link href="/register" className={styles.register}>Regístrate</Link>
      </div>
    </nav>
  );
}
