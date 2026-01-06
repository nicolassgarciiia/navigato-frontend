"use client";

import { useState } from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;

  // Lugares
  onAddLocationClick: () => void;
  onListLocationsClick: () => void;

  // Vehículos
  onAddVehicleClick: () => void;
  onListVehiclesClick: () => void;

  // Rutas
  onCalculateRouteClick: () => void;
  onListRoutesClick: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onAddLocationClick,
  onListLocationsClick,
  onAddVehicleClick,
  onListVehiclesClick,
  onCalculateRouteClick,
  onListRoutesClick,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<
    "lugares" | "vehiculos" | "rutas" | null
  >(null);

  if (!isOpen) return null;

  function closeAll(action: () => void) {
    action();
    setActiveTab(null);
    onClose();
  }

  return (
    <div className={styles.container}>
      {/* ================= MENÚ PRINCIPAL ================= */}
      <div className={styles.mainMenu}>
        <button
          className={`${styles.menuItem} ${
            activeTab === "lugares" ? styles.active : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "lugares" ? null : "lugares")
          }
        >
          📍 Gestión de lugares
        </button>

        <button
          className={`${styles.menuItem} ${
            activeTab === "vehiculos" ? styles.active : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "vehiculos" ? null : "vehiculos")
          }
        >
          🚗 Gestión de vehículos
        </button>

        <button
          className={`${styles.menuItem} ${
            activeTab === "rutas" ? styles.active : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "rutas" ? null : "rutas")
          }
        >
          🧭 Gestión de rutas
        </button>
      </div>

      {/* ================= SUBMENÚ LUGARES ================= */}
      {activeTab === "lugares" && (
        <div className={styles.subMenu}>
          <button
            className={styles.menuItem}
            onClick={() => closeAll(onAddLocationClick)}
          >
            ➕ Dar de alta lugar
          </button>

          <button
            className={styles.menuItem}
            onClick={() => closeAll(onListLocationsClick)}
          >
            📋 Lista de lugares
          </button>
        </div>
      )}

      {/* ================= SUBMENÚ VEHÍCULOS ================= */}
      {activeTab === "vehiculos" && (
        <div className={styles.subMenu}>
          <button
            className={styles.menuItem}
            onClick={() => closeAll(onAddVehicleClick)}
          >
            ➕ Dar de alta vehículo
          </button>

          <button
            className={styles.menuItem}
            onClick={() => closeAll(onListVehiclesClick)}
          >
            📋 Lista de vehículos
          </button>
        </div>
      )}

      {/* ================= SUBMENÚ RUTAS ================= */}
      {activeTab === "rutas" && (
        <div className={styles.subMenu}>
          <button
            className={styles.menuItem}
            onClick={() => closeAll(onCalculateRouteClick)}
          >
            ➕ Calcular ruta
          </button>

          <button
            className={styles.menuItem}
            onClick={() => closeAll(onListRoutesClick)}
          >
            📋 Lista de rutas
          </button>
        </div>
      )}
    </div>
  );
}
