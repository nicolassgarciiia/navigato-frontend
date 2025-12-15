import { useState } from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocationClick: () => void; 
}

export default function Sidebar({ isOpen, onClose, onAddLocationClick }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      {/* Menú Principal */}
      <div className={styles.mainMenu}>
        <button 
          className={`${styles.menuItem} ${activeTab === 'lugares' ? styles.active : ''}`}
          onClick={() => setActiveTab(activeTab === 'lugares' ? null : 'lugares')}
        >
          Gestión de lugares
        </button>
        <button className={styles.menuItem}>Gestión de vehículos</button>
        <button className={styles.menuItem}>Gestión de rutas</button>
      </div>

      {/* Submenú Flotante */}
      {activeTab === 'lugares' && (
  <div className={styles.subMenu}>
   <button 
  className={styles.menuItem} 
  onClick={() => {
    onAddLocationClick();
  }}
>
  Dar de alta lugar
</button>
    <button className={styles.menuItem}>Lista de lugares</button>
  </div>
)}
    </div>
  );
}