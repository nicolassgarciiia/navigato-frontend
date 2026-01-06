"use client";

import { useEffect, useState } from "react";
import routeFacade from "@/facade/routeFacade";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import styles from "./RouteList.module.css";

interface Route {
  nombre: string;
  distancia: number;
  duracion: number;
}

type LoadStatus = "loading" | "error" | "ready";

export default function RouteList({
  onClose,
  onSelectRoute,
}: {
  onClose: () => void;
  onSelectRoute: (route: Route) => void;
}) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

  useEffect(() => {
    async function load() {
      const res = await routeFacade.list();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setRoutes(res.data);
      setStatus("ready");
    }
    load();
  }, []);

  async function confirmDelete() {
    if (!routeToDelete) return;
    await routeFacade.delete(routeToDelete.nombre);
    setRoutes((prev) =>
      prev.filter((r) => r.nombre !== routeToDelete.nombre)
    );
    setRouteToDelete(null);
  }

  if (status === "loading") {
    return <div className={styles.wrapper}>Cargando rutas…</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>LISTA DE RUTAS</span>
        <button onClick={onClose}>✕</button>
      </div>

      {routes.length === 0 ? (
        <div className={styles.empty}>No tienes rutas guardadas</div>
      ) : (
        <ul className={styles.list}>
          {routes.map((r) => (
            <li
              key={r.nombre}
              className={styles.item}
              onClick={() => onSelectRoute(r)}
            >
              <div>
                <strong>{r.nombre}</strong>
                <div className={styles.meta}>
                  {(r.distancia / 1000).toFixed(1)} km ·{" "}
                  {Math.round(r.duracion / 60)} min
                </div>
              </div>

              <span
                className={styles.trash}
                onClick={(e) => {
                  e.stopPropagation();
                  setRouteToDelete(r);
                }}
              >
                🗑️
              </span>
            </li>
          ))}
        </ul>
      )}

      {routeToDelete && (
        <ConfirmDialog
          title="Eliminar ruta"
          message={`¿Eliminar "${routeToDelete.nombre}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setRouteToDelete(null)}
        />
      )}
    </div>
  );
}
