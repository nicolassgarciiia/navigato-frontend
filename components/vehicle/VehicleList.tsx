"use client";

import { useEffect, useMemo, useState } from "react";
import authFacade from "@/facade/authFacade";
import { vehicleFacade } from "@/facade/vehicleFacade";
import styles from "./VehicleList.module.css";

interface Vehicle {
  id: string;
  nombre: string;
  matricula: string;
  tipo: "COMBUSTION" | "ELECTRICO";
  consumo: number;
  favorito: boolean;
}

type LoadStatus = "loading" | "error" | "ready";

export default function VehicleList({
  onClose,
}: {
  onClose: () => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // Obtener correo del usuario
  // ===============================
  const correo = useMemo(() => {
    try {
      const user = authFacade.getUser();
      if (!user) return undefined;
      return typeof user === "string"
        ? JSON.parse(user)?.correo
        : user.correo;
    } catch {
      return undefined;
    }
  }, []);

  // ===============================
  // Carga inicial de vehículos
  // ===============================
  useEffect(() => {
    async function loadVehicles() {
      if (!correo) {
        setError("Usuario no autenticado");
        setStatus("error");
        return;
      }

      const result = await vehicleFacade.listVehicles(correo);

      if (!result.ok) {
        setError(result.error || "Error al cargar vehículos");
        setStatus("error");
        return;
      }

      setVehicles(result.data);
      setStatus("ready");
    }

    loadVehicles();
  }, [correo]);

  // ===============================
  // Render helpers
  // ===============================
  const renderHeader = () => (
    <div className={styles.header}>
      <span>LISTA DE VEHÍCULOS</span>
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>
    </div>
  );

  // ===============================
  // ERROR
  // ===============================
  if (status === "error") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>{error}</div>
      </div>
    );
  }

  // ===============================
  // LOADING
  // ===============================
  if (status === "loading") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>Cargando vehículos…</div>
      </div>
    );
  }

  // ===============================
  // NORMAL
  // ===============================
  return (
    <div className={styles.wrapper}>
      {renderHeader()}

      {vehicles.length === 0 ? (
        <div className={styles.empty}>
          No tienes vehículos guardados
        </div>
      ) : (
        <ul className={styles.list}>
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.name}>{vehicle.nombre}</span>
                <span className={styles.toponimo}>
                  {vehicle.matricula} · {vehicle.tipo}
                </span>
                <span className={styles.coords}>
                  Consumo: {vehicle.consumo}
                </span>
              </div>

              {/* Icono visible pero SIN funcionalidad (HU futura) */}
              <span
                className={styles.trash}
                title="Funcionalidad pendiente"
                style={{
                  cursor: "not-allowed",
                  opacity: 0.4,
                }}
              >
                🗑️
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
