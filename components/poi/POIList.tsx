"use client";

import { useEffect, useMemo, useState } from "react";
import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import styles from "./POIList.module.css";

interface POI {
  id: string;
  nombre: string;
  toponimo: string;
  latitud: number;
  longitud: number;
  favorito: boolean;
}

type LoadStatus = "loading" | "error" | "ready";

export default function POIList({
  onClose,
  onSelectPOI,
}: {
  onClose: () => void;
  onSelectPOI: (poi: POI) => void;
}) {
  const [pois, setPois] = useState<POI[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const [poiToDelete, setPoiToDelete] = useState<POI | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ===============================
  // Usuario (solo para borrado)
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
  // Carga inicial
  // ===============================
  useEffect(() => {
    async function loadPOIs() {
      if (!correo) {
        setError("Usuario no autenticado");
        setStatus("error");
        return;
      }

      const result = await poiFacade.listPOIs(correo);

      if (!result.ok) {
        setError(result.error || "Error al cargar lugares");
        setStatus("error");
        return;
      }

      setPois(result.data);
      setStatus("ready");
    }

    loadPOIs();
  }, [correo]);

  // ===============================
  // ⭐ FAVORITO (IGUAL QUE VEHICLE)
  // ===============================
  async function toggleFavorite(poiId: string) {
    let previousFavorite = false;

    // Optimistic UI
    setPois((prev) =>
      prev.map((p) => {
        if (p.id === poiId) {
          previousFavorite = p.favorito;
          return { ...p, favorito: !p.favorito };
        }
        return p;
      })
    );

    if (!correo) return;

const res = await poiFacade.toggleFavoritePOI(poiId, correo);


    if (!res.ok) {
      // Rollback correcto
      setPois((prev) =>
        prev.map((p) =>
          p.id === poiId ? { ...p, favorito: previousFavorite } : p
        )
      );
      setError(res.error ?? "No se pudo marcar como favorito");
    }
  }

  // ===============================
  // Helpers de borrado
  // ===============================
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
    if (!poiToDelete || !correo) return;

    const { id } = poiToDelete;
    if (isDeleting(id)) return;

    setError(null);
    startDeleting(id);

    const deleted = poiToDelete;
    setPoiToDelete(null);

    // Optimistic delete
    setPois((prev) => prev.filter((p) => p.id !== id));

    const result = await poiFacade.deletePOI(correo, id);

    if (!result.ok) {
      setPois((prev) => [deleted, ...prev]);
      setError(result.error || "Error al borrar el lugar");
    }

    stopDeleting(id);
  }

  // ===============================
  // Render helpers
  // ===============================
  const renderHeader = () => (
    <div className={styles.header}>
      <span>LISTA DE LUGARES</span>
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>
    </div>
  );

  // ===============================
  // ERROR / LOADING
  // ===============================
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
        <div className={styles.empty}>Cargando lugares…</div>
      </div>
    );
  }

  // ===============================
  // NORMAL
  // ===============================
  return (
    <div className={styles.wrapper}>
      {renderHeader()}

      {pois.length === 0 ? (
        <div className={styles.empty}>No tienes lugares guardados</div>
      ) : (
        <ul className={styles.list}>
          {pois.map((poi) => {
            const deleting = isDeleting(poi.id);

            return (
              <li
                key={poi.id}
                className={styles.item}
                onClick={() => onSelectPOI(poi)}
                style={{
                  opacity: deleting ? 0.55 : 1,
                  pointerEvents: deleting ? "none" : "auto",
                }}
              >
                <div className={styles.info}>
                  <span className={styles.name}>{poi.nombre}</span>
                  <span className={styles.toponimo}>{poi.toponimo}</span>
                  <span className={styles.coords}>
                    {poi.latitud.toFixed(2)}, {poi.longitud.toFixed(2)}
                  </span>
                </div>

                {/* ⭐ FAVORITO */}
                <span
                  className={styles.star}
                  title="Favorito"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(poi.id);
                  }}
                >
                  {poi.favorito ? "⭐" : "☆"}
                </span>

                {/* 🗑️ BORRAR */}
                <span
                  className={styles.trash}
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!deleting) setPoiToDelete(poi);
                  }}
                  style={{
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.35 : 0.7,
                  }}
                >
                  🗑️
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {poiToDelete && (
        <ConfirmDialog
          title="Delete location"
          message={`¿Estás seguro de que quieres borrar "${poiToDelete.nombre}"?`}
          confirmText={
            isDeleting(poiToDelete.id) ? "Deleting..." : "Delete"
          }
          cancelText="Cancel"
          onCancel={() =>
            !isDeleting(poiToDelete.id) && setPoiToDelete(null)
          }
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
