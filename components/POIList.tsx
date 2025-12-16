"use client";

import { useEffect, useState } from "react";
import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";
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

  useEffect(() => {
  const rawUser = authFacade.getUser();

  let user: any = rawUser;
  if (typeof rawUser === "string") {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  if (!user?.correo) {
    setError("Usuario no autenticado");
    setLoading(false);
    return;
  }

  const correo = user.correo;

  async function loadPOIs() {
    try {
      const result = await poiFacade.listPOIs(correo);

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



  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span>LISTA DE LUGARES</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.empty}>
          {error}
        </div>
      </div>
    );
  }

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span>LISTA DE LUGARES</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.empty}>
          Cargando lugares…
        </div>
      </div>
    );
  }

  /* ---------- NORMAL ---------- */
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>LISTA DE LUGARES</span>
        <button className={styles.close} onClick={onClose}>✕</button>
      </div>

      {pois.length === 0 ? (
        <div className={styles.empty}>
          No tienes lugares guardados
        </div>
      ) : (
        <ul className={styles.list}>
          {pois.map((poi) => (
            <li key={poi.id} className={styles.item} onClick={() => onSelectPOI(poi)}>
              <div className={styles.info}>
                <span className={styles.name}>{poi.nombre}</span>
                <span className={styles.toponimo}>{poi.toponimo}</span>
                <span className={styles.coords}>
                {poi.latitud.toFixed(2)}, {poi.longitud.toFixed(2)}
                </span>
              </div>

              <span
                className={styles.trash}
                title="Eliminar (no implementado)"
                onClick={(e) => {
                e.stopPropagation();
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
