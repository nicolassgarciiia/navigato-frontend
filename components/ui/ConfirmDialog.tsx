"use client";

import { useEffect } from "react";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  disableConfirm?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  disableConfirm = false,
}: ConfirmDialogProps) {
  // Cerrar con ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className={styles.overlay}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="dialog-title" className={styles.title}>
          {title}
        </h3>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            className={styles.cancel}
            onClick={onCancel}
            disabled={disableConfirm}
          >
            {cancelText}
          </button>

          <button
            className={styles.confirm}
            onClick={onConfirm}
            disabled={disableConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
