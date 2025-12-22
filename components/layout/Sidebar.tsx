import { useState } from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocationClick: () => void;
  onListLocationsClick: () => void;
  onAddVehicleClick: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onAddLocationClick,
  onListLocationsClick,
  onAddVehicleClick,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"lugares" | "vehiculos" | null>(
    null
  );

  if (!isOpen) return null;

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
          Gestión de lugares
        </button>

        <button
          className={`${styles.menuItem} ${
            activeTab === "vehiculos" ? styles.active : ""
          }`}
          onClick={() =>
            setActiveTab(activeTab === "vehiculos" ? null : "vehiculos")
          }
        >
          Gestión de vehículos
        </button>

        <button className={styles.menuItem} disabled>
          Gestión de rutas
        </button>
      </div>

      {/* ================= SUBMENÚ LUGARES ================= */}
      {activeTab === "lugares" && (
        <div className={styles.subMenu}>
          <button
            className={styles.menuItem}
            onClick={() => {
              onAddLocationClick();
              onClose();
            }}
          >
            Dar de alta lugar
          </button>

          <button
            className={styles.menuItem}
            onClick={() => {
              onListLocationsClick();
              onClose();
            }}
          >
            Lista de lugares
          </button>
        </div>
      )}

      {/* ================= SUBMENÚ VEHÍCULOS ================= */}
      {activeTab === "vehiculos" && (
        <div className={styles.subMenu}>
          <button
            className={styles.menuItem}
            onClick={() => {
              onAddVehicleClick();
              onClose();
            }}
          >
            Dar de alta vehículo
          </button>
        </div>
      )}
    </div>
  );
}
