import { useState } from "react";
import styles from "./VehicleCard.module.css";

interface VehicleCardProps {
  onSave: (
    nombre: string,
    matricula: string,
    tipo: "COMBUSTION" | "ELECTRICO",
    consumo: number
  ) => void;
  onClose: () => void;
  error?: string | null;
  loading?: boolean;
}

export default function VehicleCard({
  onSave,
  onClose,
  error,
  loading = false,
}: VehicleCardProps) {
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [tipo, setTipo] = useState<"COMBUSTION" | "ELECTRICO">("COMBUSTION");
  const [consumo, setConsumo] = useState<number | "">("");

  const esFormularioValido =
    nombre.trim().length >= 3 &&
    matricula.trim().length >= 3 &&
    consumo !== "" &&
    Number(consumo) >= 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && esFormularioValido) {
      onSave(nombre, matricula, tipo, Number(consumo));
    }
  };

  return (
    <div className={styles.card}>
      <button
        className={styles.closeBtn}
        onClick={onClose}
        disabled={loading}
      >
        ×
      </button>

      <div className={styles.field}>
        <label>Nombre del vehículo</label>
        <input
          placeholder="Ej: Ferari Roma"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className={`${styles.activeInput} ${
            error ? styles.inputError : ""
          }`}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label>Matrícula</label>
        <input
          placeholder="Ej: 1234 ABC"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className={`${styles.activeInput} ${
            error ? styles.inputError : ""
          }`}
        />
      </div>

      <div className={styles.field}>
        <label>Tipo de vehículo</label>
        <select
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value as "COMBUSTION" | "ELECTRICO")
          }
          disabled={loading}
          className={styles.select}
        >
          <option value="COMBUSTION">Combustión</option>
          <option value="ELECTRICO">Eléctrico</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Consumo l/100km o kWh/100km</label>
        <input
          type="number"
          min={0}
          placeholder="Ej: 6.5"
          value={consumo}
          onChange={(e) =>
            setConsumo(e.target.value === "" ? "" : Number(e.target.value))
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
          className={`${styles.activeInput} ${
            error ? styles.inputError : ""
          }`}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>

      <div className={styles.footer}>
        <button className={styles.starBtn} disabled={loading}>
          ☆
        </button>

        <button
          className={styles.addBtn}
          onClick={() =>
            onSave(nombre, matricula, tipo, Number(consumo))
          }
          disabled={loading || !esFormularioValido}
          style={{
            opacity: loading || !esFormularioValido ? 0.5 : 1,
            cursor:
              loading || !esFormularioValido
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "Guardando..." : "Añadir vehículo"}
        </button>
      </div>
    </div>
  );
}
