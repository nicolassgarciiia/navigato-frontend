"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";

import styles from "./home.module.css";
import HomeNavbar from "@/components/HomeNavbar";
import CoordinateSearch from "@/components/CoordinateSearch";
import POICard from "@/components/POICard";
import Sidebar from "@/components/Sidebar";
import Toast from "@/components/Toast";

const MapaPrincipal = dynamic(() => import("@/components/MapaPrincipal"), { ssr: false });

// 1. Extraemos el mapa de errores para facilitar su mantenimiento
const ERROR_HUMAN_MESSAGES: Record<string, string> = {
  DuplicatePOINameError: "Ya tienes un lugar con ese nombre.",
  InvalidPOINameError: "El nombre debe tener al menos 3 caracteres.",
  InvalidCoordinatesFormatError: "Las coordenadas del lugar no son válidas.",
  AuthenticationRequiredError: "Tu sesión ha caducado. Vuelve a entrar.",
  DatabaseConnectionError: "Error crítico en la base de datos.",
};

const getHumanErrorMessage = (technicalError: any): string => {
  const errorStr = String(technicalError);
  const key = Object.keys(ERROR_HUMAN_MESSAGES).find((k) => errorStr.includes(k));
  return key ? ERROR_HUMAN_MESSAGES[key] : "No se ha podido guardar el lugar por un fallo en el servidor.";
};

export default function HomePage() {
  const router = useRouter();

  // --- ESTADOS ---
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- SEGURIDAD ---
  useEffect(() => {
    if (!authFacade.isLogged()) router.push("/");
  }, [router]);

  // --- MANEJADORES DE ACCIONES ---
  const handleMoveMap = (lat: number, lng: number) => setMapCenter([lat, lng]);

  const handleAddPOI = async (lat: number, lng: number) => {
    setBackendError(null);
    handleMoveMap(lat, lng);

    const result = await poiFacade.fetchLocationDetails(lat, lng);
    if (result.ok) {
      setSelectedPOI({ lat, lng, toponimo: result.toponimo });
    } else {
      setToast({ message: `Error al obtener la dirección: ${result.error}`, type: "error" });
    }
  };

  const handleSaveFinal = async (nombre: string) => {
    const user = authFacade.getUser();
    if (!user?.correo) {
      setBackendError("No se ha podido recuperar tu sesión. Por favor, reidentifícate.");
      return;
    }

    setIsSaving(true);
    setBackendError(null);

    const result = await poiFacade.registerPOI(user.correo, nombre, selectedPOI.lat, selectedPOI.lng);

    if (result.ok) {
      setToast({ message: "¡Lugar añadido con éxito!", type: "success" });
      setSelectedPOI(null);
    } else {
      const message = getHumanErrorMessage(result.error);
      setBackendError(message);
      setToast({ message, type: "error" });
    }
    setIsSaving(false);
  };

  const handleTriggerAddPOI = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      const input = document.querySelector('input');
      if (input) {
        input.focus();
        input.style.outline = "2px solid #2563eb";
        setTimeout(() => (input.style.outline = "none"), 1500);
      }
    }, 100);
  };

  return (
    <main className={styles.main}>
      <HomeNavbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div style={{ position: 'absolute', top: '85px', left: '2.5%', zIndex: 2000 }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onAddLocationClick={handleTriggerAddPOI} />
      </div>

      <div style={{ position: 'absolute', top: '85px', left: '50%', transform: 'translateX(-50%)', zIndex: 1500 }}>
        <CoordinateSearch onSearch={handleMoveMap} onAdd={handleAddPOI} />
      </div>

      {selectedPOI && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 3000 }}>
          <POICard 
            {...selectedPOI} 
            error={backendError} 
            loading={isSaving} 
            onSave={handleSaveFinal} 
            onClose={() => { setSelectedPOI(null); setBackendError(null); }} 
          />
        </div>
      )}

      <div className={styles.mapContainer}>
        <MapaPrincipal center={mapCenter} />
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </main>
  );
}