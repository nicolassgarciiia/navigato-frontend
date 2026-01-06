"use client";

import { useEffect, useState } from "react";
import styles from "./VehicleCard.module.css";

interface Vehicle {
  id: string;
  nombre: string;
  matricula: string;
  tipo: "COMBUSTION" | "ELECTRICO";
  consumo: number;
  favorito?: boolean;
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
  const [favorito, setFavorito] = useState(false);

  // ===============================
  // Precargar datos en edición
  // ===============================
  useEffect(() => {
    if (vehicle) {
      setNombre(vehicle.nombre);
      setMatricula(vehicle.matricula);
      setTipo(vehicle.tipo);
      setConsumo(vehicle.consumo);
      setFavorito(!!vehicle.favorito);
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
      {/* CERRAR */}
      <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
        ×
      </button>

      {/* NOMBRE */}
      <div className={styles.field}>
        <label>Nombre del vehículo</label>
        <input
          placeholder="Ej: Ferrari Roma"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className={`${styles.activeInput} ${
            nombre.length > 0 && nombre.length < 3 ? styles.inputError : ""
          }`}
          autoFocus
        />
        {nombre.length > 0 && nombre.length < 3 && (
          <span className={styles.helperTextError}>
            El nombre debe tener al menos 3 caracteres
          </span>
        )}
      </div>

      {/* MATRÍCULA */}
      <div className={styles.field}>
        <label>Matrícula</label>
        <input
          placeholder="Ej: 1234 ABC"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || isEditMode} // no editable en HU12
          className={`${styles.activeInput} ${
            !isEditMode && matricula.length > 0 && matricula.length < 3
              ? styles.inputError
              : ""
          }`}
        />
        {!isEditMode && matricula.length > 0 && matricula.length < 3 && (
          <span className={styles.helperTextError}>
            La matrícula es obligatoria al crear el vehículo
          </span>
        )}
      </div>

      {/* TIPO */}
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

      {/* CONSUMO */}
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
            consumo !== "" && Number(consumo) < 0 ? styles.inputError : ""
          }`}
        />
        {consumo !== "" && Number(consumo) < 0 && (
          <span className={styles.helperTextError}>
            El consumo debe ser un valor positivo
          </span>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <button
          className={styles.addBtn}
          onClick={handleSave}
          disabled={loading || !esFormularioValido}
        >
          {loading
            ? "Guardando..."
            : isEditMode
            ? "Guardar cambios"
            : "Añadir vehículo"}
        </button>
      </div>

      {/* ⭐ FAVORITO */}
      {!isEditMode && (
        <button
          className={styles.starBtn}
          title="Marcar como favorito"
          onClick={() => setFavorito((f) => !f)}
          disabled={loading}
        >
          {favorito ? "⭐" : "☆"}
        </button>
      )}
    </div>
  );
}
