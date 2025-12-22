"use client";

import { useEffect, useMemo, useState } from "react";
import authFacade from "@/facade/authFacade";
import { vehicleFacade } from "@/facade/vehicleFacade";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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

export default function VehicleList({ onClose }: { onClose: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const correo = useMemo(() => {
    try {
      const user = authFacade.getUser();
      if (!user) return undefined;
      return typeof user === "string" ? JSON.parse(user)?.correo : user.correo;
    } catch {
      return undefined;
    }
  }, []);

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

  const isDeleting = (id: string) => deletingIds.has(id);

  const startDeleting = (id: string) =>
    setDeletingIds((prev) => new Set(prev).add(id));

  const stopDeleting = (id: string) =>
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  async function confirmDelete() {
    if (!vehicleToDelete || !correo) return;

    const { id } = vehicleToDelete;
    if (isDeleting(id)) return;

    setError(null);
    startDeleting(id);

    const deleted = vehicleToDelete;
    setVehicleToDelete(null);

    // Optimistic UI
    setVehicles((prev) => prev.filter((v) => v.id !== id));

    const result = await vehicleFacade.deleteVehicle(correo, id);

    if (!result.ok) {
      // rollback
      setVehicles((prev) => [deleted, ...prev]);
      setError(result.error || "Error al borrar el vehículo");
    }

    stopDeleting(id);
  }

  const renderHeader = () => (
    <div className={styles.header}>
      <span>LISTA DE VEHÍCULOS</span>
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>
    </div>
  );

  if (status === "error") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>{error}</div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>Cargando vehículos…</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {renderHeader()}

      {vehicles.length === 0 ? (
        <div className={styles.empty}>No tienes vehículos guardados</div>
      ) : (
        <ul className={styles.list}>
          {vehicles.map((vehicle) => {
            const deleting = isDeleting(vehicle.id);

            return (
              <li
                key={vehicle.id}
                className={styles.item}
                style={{
                  opacity: deleting ? 0.55 : 1,
                  pointerEvents: deleting ? "none" : "auto",
                }}
              >
                <div className={styles.info}>
                  <span className={styles.name}>{vehicle.nombre}</span>
                  <span className={styles.toponimo}>
                    {vehicle.matricula} · {vehicle.tipo}
                  </span>
                  <span className={styles.coords}>
                    Consumo: {vehicle.consumo}
                  </span>
                </div>

                <span
                  className={styles.trash}
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!deleting) setVehicleToDelete(vehicle);
                  }}
                  style={{
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.35 : 1,
                  }}
                >
                  🗑️
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {vehicleToDelete && (
        <ConfirmDialog
          title="Delete vehicle"
          message={`¿Estás seguro de que quieres borrar "${vehicleToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmText={isDeleting(vehicleToDelete.id) ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onCancel={() =>
            !isDeleting(vehicleToDelete.id) && setVehicleToDelete(null)
          }
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
