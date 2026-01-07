"use client";

import { useEffect, useState } from "react";
import routeFacade from "@/facade/routeFacade";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import styles from "./RouteList.module.css";

interface Route {
  nombre: string;
  distancia: number;
  duracion: number;
  favorito?: boolean;
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
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // CARGA INICIAL
  // ===============================
  useEffect(() => {
    async function load() {
      const res = await routeFacade.list();
      if (!res.ok) {
        setError(res.error ?? "Error al cargar rutas");
        setStatus("error");
        return;
      }
      setRoutes(res.data);
      setStatus("ready");
    }
    load();
  }, []);

  // ===============================
  // ⭐ FAVORITO (MISMA LÓGICA QUE ANTES)
  // ===============================
  async function toggleFavorite(nombre: string) {
    const res = await routeFacade.toggleFavorite(nombre);
    if (!res.ok) return;

    setRoutes((prev) =>
      prev.map((r) =>
        r.nombre === nombre ? { ...r, favorito: !r.favorito } : r
      )
    );
  }

  // ===============================
  // BORRADO
  // ===============================
  async function confirmDelete() {
    if (!routeToDelete) return;

    const deleted = routeToDelete;
    setRouteToDelete(null);

    setRoutes((prev) =>
      prev.filter((r) => r.nombre !== deleted.nombre)
    );

    const res = await routeFacade.delete(deleted.nombre);
    if (!res.ok) {
      setRoutes((prev) => [deleted, ...prev]);
    }
  }

  // ===============================
  // HEADER
  // ===============================
  const renderHeader = () => (
    <div className={styles.header}>
      <span>LISTA DE RUTAS</span>
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>
    </div>
  );

  // ===============================
  // LOADING / ERROR
  // ===============================
  if (status === "loading") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>Cargando rutas…</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.wrapper}>
        {renderHeader()}
        <div className={styles.empty}>{error}</div>
      </div>
    );
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className={styles.wrapper}>
      {renderHeader()}

      {routes.length === 0 ? (
        <div className={styles.empty}>No tienes rutas guardadas</div>
      ) : (
        <ul className={styles.list}>
          {routes.map((route) => (
            <li
              key={route.nombre}
              className={styles.item}
              onClick={() => onSelectRoute(route)}
            >
              <div className={styles.info}>
                <span className={styles.name}>{route.nombre}</span>
              </div>

              {/* ⭐ FAVORITO */}
              <span
                className={styles.star}
                title="Favorito"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(route.nombre);
                }}
              >
                {route.favorito ? "⭐" : "☆"}
              </span>

              {/* 🗑️ BORRAR */}
              <span
                className={styles.trash}
                title="Eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  setRouteToDelete(route);
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
