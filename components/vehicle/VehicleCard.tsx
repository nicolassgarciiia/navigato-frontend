import { useEffect, useState } from "react";
import styles from "./VehicleCard.module.css";

interface Vehicle {
  id: string;
  nombre: string;
  matricula: string;
  tipo: "COMBUSTION" | "ELECTRICO";
  consumo: number;
}

interface VehicleCardProps {
  vehicle?: Vehicle; // si viene, estamos editando
  onSave: (data:
    | {
        // crear vehículo
        nombre: string;
        matricula: string;
        tipo: "COMBUSTION" | "ELECTRICO";
        consumo: number;
      }
    | {
        // editar vehículo (HU12)
        nombre?: string;
        consumo?: number;
      }
  ) => void;
  onClose: () => void;
  error?: string | null;
  loading?: boolean;
}

export default function VehicleCard({
  vehicle,
  onSave,
  onClose,
  error,
  loading = false,
}: VehicleCardProps) {
  const isEditMode = !!vehicle;

  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [tipo, setTipo] =
    useState<"COMBUSTION" | "ELECTRICO">("COMBUSTION");
  const [consumo, setConsumo] = useState<number | "">("");

  // ===============================
  // Precargar datos en edición
  // ===============================
  useEffect(() => {
    if (vehicle) {
      setNombre(vehicle.nombre);
      setMatricula(vehicle.matricula);
      setTipo(vehicle.tipo);
      setConsumo(vehicle.consumo);
    }
  }, [vehicle]);

  const esFormularioValido =
    nombre.trim().length >= 3 &&
    consumo !== "" &&
    Number(consumo) > 0 &&
    (isEditMode || matricula.trim().length >= 3);

  const handleSave = () => {
    if (!esFormularioValido || loading) return;

    if (isEditMode) {
      // HU12 – SOLO nombre y consumo
      onSave({
        nombre,
        consumo: Number(consumo),
      });
    } else {
      // Alta de vehículo
      onSave({
        nombre,
        matricula,
        tipo,
        consumo: Number(consumo),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
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
          placeholder="Ej: Ferrari Roma"
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
          disabled={loading || isEditMode} // no editable en HU12
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
          disabled={loading || isEditMode} // no editable en HU12
          className={styles.select}
        >
          <option value="COMBUSTION">Combustión</option>
          <option value="ELECTRICO">Eléctrico</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Consumo (l/100km o kWh/100km)</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
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
        <button className={styles.starBtn} disabled>
          ☆
        </button>

        <button
          className={styles.addBtn}
          onClick={handleSave}
          disabled={loading || !esFormularioValido}
          style={{
            opacity: loading || !esFormularioValido ? 0.5 : 1,
            cursor:
              loading || !esFormularioValido
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? "Guardando..."
            : isEditMode
            ? "Guardar cambios"
            : "Añadir vehículo"}
        </button>
      </div>
    </div>
  );
}
