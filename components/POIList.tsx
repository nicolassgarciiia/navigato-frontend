"use client";

import { useEffect, useMemo, useState } from "react";
import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";
import ConfirmDialog from "@/components/ConfirmDialog";
import styles from "./POIList.module.css";

interface POI {
  id: string;
  nombre: string;
  toponimo: string;
  latitud: number;
  longitud: number;
  favorito: boolean;
}

export default function POIList({
  onClose,
  onSelectPOI,
}: {
  onClose: () => void;
  onSelectPOI: (poi: POI) => void;
}) {
  const [pois, setPois] = useState<POI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // POI pendiente de confirmar borrado
  const [poiToDelete, setPoiToDelete] = useState<POI | null>(null);

  // ids que están siendo borrados (para bloquear UI)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // cacheamos el correo una vez para no repetir parseos
  const correo = useMemo(() => {
    const rawUser = authFacade.getUser();

    let user: any = rawUser;
    if (typeof rawUser === "string") {
      try {
        user = JSON.parse(rawUser);
      } catch {
        user = null;
      }
    }

    return user?.correo as string | undefined;
  }, []);

  useEffect(() => {
    if (!correo) {
      setError("Usuario no autenticado");
      setLoading(false);
      return;
    }

     async function loadPOIs() {
    try {
      if (!correo) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const userEmail = correo; 

      const result = await poiFacade.listPOIs(userEmail);
      if (result.ok) {
        setPois(result.data || []);
      } else {
        setError(result.error || "Error al cargar lugares");
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  loadPOIs();
}, []);


  const isDeleting = (id: string) => deletingIds.has(id);

  const startDeleting = (id: string) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const stopDeleting = (id: string) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  async function confirmDelete() {
    if (!poiToDelete) return;
    if (!correo) {
      setError("Usuario no autenticado");
      setPoiToDelete(null);
      return;
    }

    const id = poiToDelete.id;

    // Evita doble borrado por doble click o re-render
    if (isDeleting(id)) return;

    setError(null);
    startDeleting(id);

    // UX: cerramos el modal inmediatamente, y dejamos el item bloqueado
    const deleted = poiToDelete;
    setPoiToDelete(null);

    // Optimistic UI: lo quitamos ya de la lista
    setPois((prev) => prev.filter((p) => p.id !== id));

    const result = await poiFacade.deletePOI(correo, id);

    if (!result.ok) {
      // Rollback si falla
      setPois((prev) => [deleted, ...prev]);
      setError(result.error || "Error al borrar el lugar");
    }

    stopDeleting(id);
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span>LISTA DE LUGARES</span>
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.empty}>{error}</div>

        {/* Confirm dialog (si justo hay uno abierto) */}
        {poiToDelete && (
          <ConfirmDialog
            title="Delete location"
            message={`Are you sure you want to delete "${poiToDelete.nombre}"? This action cannot be undone.`}
            confirmText={isDeleting(poiToDelete.id) ? "Deleting..." : "Delete"}
            cancelText="Cancel"
            onCancel={() => setPoiToDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    );
  }

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span>LISTA DE LUGARES</span>
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.empty}>Cargando lugares…</div>
      </div>
    );
  }

  /* ---------- NORMAL ---------- */
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>LISTA DE LUGARES</span>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>
      </div>

      {pois.length === 0 ? (
        <div className={styles.empty}>No tienes lugares guardados</div>
      ) : (
        <ul className={styles.list}>
          {pois.map((poi) => (
            <li
              key={poi.id}
              className={styles.item}
              onClick={() => onSelectPOI(poi)}
              style={{
                opacity: isDeleting(poi.id) ? 0.55 : 1,
                pointerEvents: isDeleting(poi.id) ? "none" : "auto",
              }}
            >
              <div className={styles.info}>
                <span className={styles.name}>{poi.nombre}</span>
                <span className={styles.toponimo}>{poi.toponimo}</span>
                <span className={styles.coords}>
                  {poi.latitud.toFixed(2)}, {poi.longitud.toFixed(2)}
                </span>
              </div>

              <span
                className={styles.trash}
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDeleting(poi.id)) return;
                  setPoiToDelete(poi);
                }}
                style={{
                  cursor: isDeleting(poi.id) ? "not-allowed" : "pointer",
                  opacity: isDeleting(poi.id) ? 0.35 : 0.7,
                  pointerEvents: isDeleting(poi.id) ? "none" : "auto",
                }}
              >
                🗑️
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Confirm dialog */}
      {poiToDelete && (
        <ConfirmDialog
          title="Delete location"
          message={`Are you sure you want to delete "${poiToDelete.nombre}"? This action cannot be undone.`}
          confirmText={isDeleting(poiToDelete.id) ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onCancel={() => {
            if (isDeleting(poiToDelete.id)) return; // no cerrar si está borrando
            setPoiToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
