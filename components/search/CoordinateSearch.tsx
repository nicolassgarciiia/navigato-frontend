import { useState } from "react";
import styles from "./CoordinateSearch.module.css";
import type { RefObject } from "react";

interface CoordinateSearchProps {
  onSearch: (lat: number, lng: number) => void;
  onAdd: (lat: number, lng: number) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}


export default function CoordinateSearch({ onSearch, onAdd, inputRef }: CoordinateSearchProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null); // Nuevo estado para el error

  const getValidCoords = () => {
    setError(null); // Limpiamos errores previos
    const parts = input.split(",");
    
    if (parts.length !== 2) {
      setError("Formato: Latitud, Longitud (ej: 39.4, -0.3)");
      return null;
    }

    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());

    if (isNaN(lat) || isNaN(lng)) {
      setError("Los valores deben ser números decimales.");
      return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Límites: Lat [-90, 90] | Lng [-180, 180]");
      return null;
    }

    return { lat, lng };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const coords = getValidCoords();
      if (coords) onSearch(coords.lat, coords.lng);
    }
  };

  const handleAdd = () => {
    const coords = getValidCoords();
    if (coords) onAdd(coords.lat, coords.lng);
  };

  return (
    <div className={styles.wrapper}> {/* Contenedor para posicionar el error */}
      <div className={styles.searchBar}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          placeholder="Lat, Lng (ej: 39.46, -0.37)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.clearBtn} onClick={() => setInput("")}>×</button>
        <div className={styles.divider}></div>
        <button className={styles.plusBtn} onClick={handleAdd}>+</button>
      </div>

      {/*Mensaje de error elegante justo debajo */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
}