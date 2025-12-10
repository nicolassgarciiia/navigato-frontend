"use client";

import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <p className={styles.title}>
          Proyecto académico asignaturas 1048 y 1039
        </p>

        <p className={styles.subtitle}>
          Desarrollado por Nicolás, Matías y Alberto — Universitat Jaume I (2025-2026)
        </p>
      </div>
    </footer>
  );
}
