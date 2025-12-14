import { useState } from "react";
import styles from "./POICard.module.css";

export default function POICard({ lat, lng, toponimo, onSave, onClose, error, loading }: any) {
  const [nombre, setNombre] = useState("");

  const esNombreValido = nombre.trim().length >= 3;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && esNombreValido) {
      onSave(nombre);
    }
  };

  return (
    <div className={styles.card}>
      <button className={styles.closeBtn} onClick={onClose} disabled={loading}>×</button>
      
      <div className={styles.field}>
        <label>Coordenadas</label>
        <input disabled value={`${lat}, ${lng}`} className={styles.disabled} />
      </div>

      <div className={styles.field}>
        <label>Topónimo</label>
        <textarea disabled value={toponimo} className={styles.textarea} />
      </div>

      <div className={styles.field}>
        <label>Nombre del lugar</label>
        <input 
          placeholder="Ej: Mi casa" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          onKeyDown={handleKeyDown} 
          disabled={loading}
          className={`${styles.activeInput} ${error ? styles.inputError : ""}`}
          autoFocus 
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>

      <div className={styles.footer}>
        <button className={styles.starBtn} disabled={loading}>☆</button>
        <button 
          className={styles.addBtn} 
          onClick={() => onSave(nombre)}
          disabled={loading || !esNombreValido} 
          style={{ 
            opacity: (loading || !esNombreValido) ? 0.5 : 1,
            cursor: (loading || !esNombreValido) ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Guardando..." : "Añadir lugar"}
        </button>
      </div>
    </div>
  );
}