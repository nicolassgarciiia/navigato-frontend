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
  vehicle?: Vehicle;
  onSave: (
    nombre: string,
    matricula: string,
    tipo: "COMBUSTION" | "ELECTRICO",
    consumo: number,
    favorito: boolean
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
  const [tipo, setTipo] = useState<"COMBUSTION" | "ELECTRICO">("COMBUSTION");
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

  // ===============================
  // Validación
  // ===============================
  const esFormularioValido = isEditMode
    ? consumo !== "" && Number(consumo) >= 0
    : nombre.trim().length >= 3 &&
      matricula.trim().length >= 3 &&
      consumo !== "" &&
      Number(consumo) >= 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && esFormularioValido) {
      onSave(nombre, matricula, tipo, Number(consumo), favorito);
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
          value={nombre}
          disabled={isEditMode || loading}
          className={styles.disabled}
        />
      </div>

      {/* MATRÍCULA */}
      <div className={styles.field}>
        <label>Matrícula</label>
        <input
          value={matricula}
          disabled
          className={styles.disabled}
        />
      </div>

      {/* TIPO */}
      <div className={styles.field}>
        <label>Tipo de vehículo</label>
        <select value={tipo} disabled className={styles.disabled}>
          <option value="COMBUSTION">Combustión</option>
          <option value="ELECTRICO">Eléctrico</option>
        </select>
      </div>

      {/* CONSUMO (ÚNICO EDITABLE EN UPDATE) */}
      <div className={styles.field}>
        <label>Consumo (l/100km o kWh/100km)</label>
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
          onClick={() =>
            onSave(nombre, matricula, tipo, consumo as number, favorito)
          }
          disabled={loading || !esFormularioValido}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
