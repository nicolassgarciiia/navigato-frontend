"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/transparente.png"   
          alt="Navigato Logo"
          width={240}
          height={80}
          style={{ height: "80px", width: "auto" }}
          priority
        />
      </Link>

      <div className={styles.buttons}>
        <Link href="/login" className={styles.login}>Inicia sesión</Link>
        <Link href="/register" className={styles.register}>Regístrate</Link>
      </div>
    </nav>
  );
}
