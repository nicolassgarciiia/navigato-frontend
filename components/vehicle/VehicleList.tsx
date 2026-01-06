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

export default function VehicleList({
  onClose,
  onEditVehicle,
}: {
  onClose: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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
  // Cargar vehículos
  // ===============================
  useEffect(() => {
    async function loadVehicles() {
      setStatus("loading");

      const vehiclesResult = await vehicleFacade.listVehicles();
      if (!vehiclesResult.ok) {
        setError(vehiclesResult.error);
        setStatus("error");
        return;
      }

      setVehicles(vehiclesResult.data);
      setStatus("ready");
    }

    loadVehicles();
  }, []);

  const isDeleting = (id: string) => deletingIds.has(id);

  // ===============================
  // Borrado
  // ===============================
  async function confirmDelete() {
    if (!vehicleToDelete || !correo) return;

    const { id } = vehicleToDelete;
    if (isDeleting(id)) return;

    setDeletingIds((prev) => new Set(prev).add(id));

    const deleted = vehicleToDelete;
    setVehicleToDelete(null);
    setVehicles((prev) => prev.filter((v) => v.id !== id));

    const result = await vehicleFacade.deleteVehicle(correo, id);

    if (!result.ok) {
      setVehicles((prev) => [deleted, ...prev]);
      setError(result.error || "Error al borrar el vehículo");
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const renderHeader = () => (
    <div className={styles.header}>
      <span>LISTA DE VEHÍCULOS</span>
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>
    </div>
  );

  if (status !== "ready") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>
          {status === "loading" ? "Cargando vehículos…" : error}
        </div>
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

                {/* EDITAR */}
                <span
                  className={styles.edit}
                  title="Editar"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditVehicle(vehicle);
                  }}
                >
                  ✏️
                </span>

                {/* ⭐ FAVORITO */}
                <span
                  className={styles.star}
                  title="Marcar como favorito"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setError(null);

                    setVehicles((prev) =>
                      prev.map((v) =>
                        v.id === vehicle.id
                          ? { ...v, favorito: !v.favorito }
                          : v
                      )
                    );

                    const res = await vehicleFacade.toggleFavorite(vehicle.id);

                    if (!res.ok) {
                      setVehicles((prev) =>
                        prev.map((v) =>
                          v.id === vehicle.id
                            ? { ...v, favorito: !v.favorito }
                            : v
                        )
                      );
                      setError(
                        res.error ?? "No se pudo marcar como favorito"
                      );
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {vehicle.favorito ? "⭐" : "☆"}
                </span>

                {/* BORRAR */}
                <span
                  className={styles.trash}
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!deleting) setVehicleToDelete(vehicle);
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
          message={`¿Estás seguro de que quieres borrar "${vehicleToDelete.nombre}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => setVehicleToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
