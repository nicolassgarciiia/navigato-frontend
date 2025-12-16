"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import POIList from "@/components/POIList";
import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";
import { getCoordinatesFromToponym } from "@/lib/api";

import styles from "./home.module.css";
import HomeNavbar from "@/components/HomeNavbar";
import CoordinateSearch from "@/components/CoordinateSearch";
import ToponymSearch from "@/components/ToponymSearch";
import POICard from "@/components/POICard";
import Sidebar from "@/components/Sidebar";
import Toast from "@/components/Toast";

const MapaPrincipal = dynamic(
  () => import("@/components/MapaPrincipal"),
  { ssr: false }
);

// ======================================================
// ERRORES HUMANOS
// ======================================================
const ERROR_HUMAN_MESSAGES: Record<string, string> = {
  DuplicatePOINameError: "Ya tienes un lugar con ese nombre.",
  InvalidPOINameError: "El nombre debe tener al menos 3 caracteres.",
  InvalidCoordinatesFormatError: "Las coordenadas del lugar no son válidas.",
  AuthenticationRequiredError: "Tu sesión ha caducado. Vuelve a entrar.",
  DatabaseConnectionError: "Error crítico en la base de datos.",
};

const getHumanErrorMessage = (technicalError: any): string => {
  const errorStr = String(technicalError);
  const key = Object.keys(ERROR_HUMAN_MESSAGES).find((k) =>
    errorStr.includes(k)
  );
  return key
    ? ERROR_HUMAN_MESSAGES[key]
    : "No se ha podido guardar el lugar por un fallo en el servidor.";
};

export default function HomePage() {
  const router = useRouter();

  // ======================================================
  // ESTADOS
  // ======================================================
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPOIList, setShowPOIList] = useState(false);
  const [searchMode, setSearchMode] = useState<"coords" | "toponym">("coords");
  const coordInputRef = useRef<HTMLInputElement>(null);
  const toponymInputRef = useRef<HTMLInputElement>(null);

  // ======================================================
  // SEGURIDAD
  // ======================================================
  useEffect(() => {
    if (!authFacade.isLogged()) router.push("/");
  }, [router]);

  // ======================================================
  // UTILIDADES
  // ======================================================
  const centerMap = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
  };

  const resolveToponym = async (toponimo: string) => {
    const result = await getCoordinatesFromToponym(toponimo);

    if (
      !result.ok ||
      typeof result.lat !== "number" ||
      typeof result.lng !== "number"
    ) {
      setToast({ message: "No se pudo localizar el lugar", type: "error" });
      return null;
    }

    return { lat: result.lat, lng: result.lng };
  };

  // ======================================================
  // FLUJO ÚNICO DE CREACIÓN DE POI
  // ======================================================
  const openPOIFromCoords = async (
    lat: number,
    lng: number,
    nombreInicial?: string
  ) => {
    setBackendError(null);
    centerMap(lat, lng);

    const result = await poiFacade.fetchLocationDetails(lat, lng);

    if (result.ok) {
      setSelectedPOI({
        lat,
        lng,
        toponimo: nombreInicial || result.toponimo,
      });
    } else {
      setToast({
        message: `Error al obtener la dirección: ${result.error}`,
        type: "error",
      });
    }
  };

  // ======================================================
  // HANDLERS DE ENTRADA
  // ======================================================
  // Coordenadas
  const handleSearchByCoords = (lat: number, lng: number) => {
    centerMap(lat, lng);
  };

  const handleTriggerAddPOI = () => {
  setIsSidebarOpen(false);

  setTimeout(() => {
    if (searchMode === "coords") {
      coordInputRef.current?.focus();
    } else {
      toponymInputRef.current?.focus();
    }
  }, 100);
};


  const handleAddByCoords = (lat: number, lng: number) => {
    openPOIFromCoords(lat, lng);
  };

  // Topónimo
  const handleSearchByToponym = async (toponimo: string) => {
    const coords = await resolveToponym(toponimo);
    if (coords) centerMap(coords.lat, coords.lng);
  };

  const handleAddByToponym = async (toponimo: string) => {
    const coords = await resolveToponym(toponimo);
    if (coords) openPOIFromCoords(coords.lat, coords.lng, toponimo);
  };

  // ======================================================
  // GUARDAR POI
  // ======================================================
  const handleSaveFinal = async (nombre: string) => {
    const user = authFacade.getUser();

    if (!user?.correo) {
      setBackendError("No se ha podido recuperar tu sesión.");
      return;
    }

    setIsSaving(true);
    setBackendError(null);

    const result = await poiFacade.registerPOI(
      user.correo,
      nombre,
      selectedPOI.lat,
      selectedPOI.lng
    );

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

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <main className={styles.main}>
      <HomeNavbar onToggleSidebar={() => setIsSidebarOpen((p) => !p)} />

      <div style={{ position: "absolute", top: 85, left: "2.5%", zIndex: 2000 }}>
        <Sidebar
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}

  onAddLocationClick={() => {
    setIsSidebarOpen(false);
    setShowPOIList(false);

    setSearchMode("coords");
    setTimeout(() => {
      coordInputRef.current?.focus();
    }, 100);
  }}

  onListLocationsClick={() => {
    setIsSidebarOpen(false);
    setShowPOIList(false);

    setTimeout(() => {
      setShowPOIList(true);
    }, 0);
  }}
/>




      </div>

      <div
        style={{
          position: "absolute",
          top: 85,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1500,
        }}
      >
        <div className={styles.searchSelector}>
  <div className={styles.searchTitle}>
    ¿Cómo quieres buscar el lugar?
  </div>

  <div className={styles.searchSubtitle}>
    Elige una opción para empezar
  </div>

  <div className={styles.searchButtons}>
    <button
      className={`${styles.searchBtn} ${
        searchMode === "coords" ? styles.active : ""
      }`}
      onClick={() => setSearchMode("coords")}
    >
      📍 Por coordenadas
    </button>

    <button
      className={`${styles.searchBtn} ${
        searchMode === "toponym" ? styles.active : ""
      }`}
      onClick={() => setSearchMode("toponym")}
    >
      🏙️ Por topónimo
    </button>
  </div>
</div>


        {searchMode === "coords" ? (
          <CoordinateSearch
            onSearch={handleSearchByCoords}
            onAdd={handleAddByCoords}
            inputRef={coordInputRef}
          />
        ) : (
          <ToponymSearch
            onSearch={handleSearchByToponym}
            onAdd={handleAddByToponym}
            inputRef={toponymInputRef}
          />
        )}
      </div>

      {selectedPOI && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3000,
          }}
        >
          <POICard
            {...selectedPOI}
            error={backendError}
            loading={isSaving}
            onSave={handleSaveFinal}
            onClose={() => {
              setSelectedPOI(null);
              setBackendError(null);
            }}
          />
        </div>
      )}

      <div className={styles.mapContainer}>
  <MapaPrincipal
    center={mapCenter}
    onMapClick={(lat, lng) => {
      openPOIFromCoords(lat, lng);
    }}
  />
</div>
{showPOIList && (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 3000,
    }}
  >
    <POIList
      onClose={() => setShowPOIList(false)}
      onSelectPOI={(poi) => {
        setShowPOIList(false);
        setMapCenter([poi.latitud, poi.longitud]);
      }}
    />
  </div>
)}





      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </main>
  );
}
