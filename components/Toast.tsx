import { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // Se cierra solo en 4 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{type === "success" ? "✅" : "❌"}</span>
      <p className={styles.message}>{message}</p>
      <button onClick={onClose} className={styles.closeBtn}>×</button>
    </div>
  );
}