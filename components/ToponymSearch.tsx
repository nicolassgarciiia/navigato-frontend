import { useState } from "react";
import styles from "./CoordinateSearch.module.css";
import type { RefObject } from "react";

interface ToponymSearchProps {
  onSearch: (toponimo: string) => void;
  onAdd: (toponimo: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function ToponymSearch({
  onSearch,
  onAdd, inputRef
}: ToponymSearchProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------
  // Validación del topónimo (equivalente a getValidCoords)
  // --------------------------------------------------
  const getValidToponym = () => {
    setError(null);

    const value = input.trim();

    if (!value) {
      setError("Introduce un lugar (ej: Madrid)");
      return null;
    }

    if (value.length < 2) {
      setError("El nombre del lugar es demasiado corto");
      return null;
    }

    return value;
  };

  // --------------------------------------------------
  // Enter → buscar (IGUAL que CoordinateSearch)
  // --------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const toponimo = getValidToponym();
      if (toponimo) onSearch(toponimo);
    }
  };

  // --------------------------------------------------
  // + → añadir (IGUAL que CoordinateSearch)
  // --------------------------------------------------
  const handleAdd = () => {
    const toponimo = getValidToponym();
    if (toponimo) onAdd(toponimo);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBar}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          placeholder="Buscar lugar (ej: Madrid)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
        />

        <button
          className={styles.clearBtn}
          onClick={() => setInput("")}
        >
          ×
        </button>

        <div className={styles.divider}></div>

        <button
          className={styles.plusBtn}
          onClick={handleAdd}
        >
          +
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
}
