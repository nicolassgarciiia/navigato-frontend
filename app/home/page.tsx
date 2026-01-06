"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import RouteFromPOIsCard from "../routes/RouteFromPOIsCard";


import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";
import { vehicleFacade } from "@/facade/vehicleFacade";
import { getCoordinatesFromToponym } from "@/lib/api";

import styles from "./home.module.css";

import HomeNavbar from "@/components/layout/HomeNavbar";
import Sidebar from "@/components/layout/Sidebar";
import CoordinateSearch from "@/components/search/CoordinateSearch";
import ToponymSearch from "@/components/search/ToponymSearch";

import POICard from "@/components/poi/POICard";
import POIList from "@/components/poi/POIList";
import VehicleCard from "@/components/vehicle/VehicleCard";
import Toast from "@/components/ui/Toast";
import VehicleList from "@/components/vehicle/VehicleList";
import RouteCard from "../routes/RouteCard";
import MapPointActionsCard from "@/components/map/MapPointActionsCard";
import SavedRoutesCard from "../routes/SavedRoutesCard";

const MapaPrincipal = dynamic(
  () => import("@/components/map/MapaPrincipal"),
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
  InvalidVehicleConsumptionError: "El consumo no puede ser negativo.",
};

const getHumanErrorMessage = (technicalError: any): string => {
  const errorStr = String(technicalError);
  const key = Object.keys(ERROR_HUMAN_MESSAGES).find((k) =>
    errorStr.includes(k)
  );
  return key
    ? ERROR_HUMAN_MESSAGES[key]
    : "No se ha podido guardar por un fallo en el servidor.";
};

export default function HomePage() {
  const router = useRouter();

  // ======================================================
  // ESTADOS
  // ======================================================
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  const [showPOIList, setShowPOIList] = useState(false);
  const [showVehicleCard, setShowVehicleCard] = useState(false);
  const [showRouteCard, setShowRouteCard] = useState(false);
  const [showSavedRoutes, setShowSavedRoutes] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [routeLine, setRouteLine] =useState<[number, number][] | null>(null);
  

  const [selectedPoint, setSelectedPoint] = useState<{
    lat: number;
    lng: number;
    toponimo?: string;
  } | null>(null);

  const [routeOrigin, setRouteOrigin] = useState<any>(null);
  const [routeDestination, setRouteDestination] = useState<any>(null);



  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [searchMode, setSearchMode] = useState<"coords" | "toponym">("coords");
  const coordInputRef = useRef<HTMLInputElement>(null);
  const toponymInputRef = useRef<HTMLInputElement>(null);
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<any>(null);
  const [showRouteFromPOIs, setShowRouteFromPOIs] = useState(false);


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

    if (!result.ok || typeof result.lat !== "number") {
      setToast({ message: "No se pudo localizar el lugar", type: "error" });
      return null;
    }

    return { lat: result.lat, lng: result.lng };
  };

  // ======================================================
  // POIs
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
        toponimo: nombreInicial || result.data.toponimo,
      });
    } else {
      setToast({
        message: `Error al obtener la dirección: ${result.error}`,
        type: "error",
      });
    }
  };

  const handleSavePOI = async (nombre: string) => {
    const user = authFacade.getUser();
    if (!user?.correo) return;

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
  const handleSearchByToponym = async (toponimo: string) => {
  const coords = await resolveToponym(toponimo);
  if (coords) {
    centerMap(coords.lat, coords.lng);
  }
};

const handleAddByToponym = async (toponimo: string) => {
  const coords = await resolveToponym(toponimo);
  if (coords) {
    openPOIFromCoords(coords.lat, coords.lng, toponimo);
  }
};


  // ======================================================
  // VEHÍCULOS
  // ======================================================
  const handleSaveVehicle = async (
  nombre: string,
  matricula: string,
  tipo: "COMBUSTION" | "ELECTRICO",
  consumo: number,
  favorito: boolean
) => {
  setIsSaving(true);
  setBackendError(null);

  const result = await vehicleFacade.registerVehicle(
    nombre,
    matricula,
    tipo,
    consumo,
    favorito
  );

  if (result.ok) {
    setToast({ message: "¡Vehículo añadido con éxito!", type: "success" });
    setShowVehicleCard(false);
  } else {
    const message = getHumanErrorMessage(result.error);
    setBackendError(message);
    setToast({ message, type: "error" });
  }

  setIsSaving(false);
};

  const handleUpdateVehicle = async (vehicleId: string, consumo: number) => {
  const user = authFacade.getUser();
  if (!user?.correo) return;

  setIsSaving(true);
  setBackendError(null);

  const result = await vehicleFacade.updateVehicle(
    user.correo,
    vehicleId,
    consumo
  );

  if (result.ok) {
    setToast({ message: "Vehículo actualizado", type: "success" });
    setVehicleToEdit(null);
  } else {
    setBackendError(result.error);
    setToast({ message: result.error, type: "error" });
  }

  setIsSaving(false);
};


  // ======================================================
  // RUTAS
  // ======================================================

  const handleRouteCalculated = (route: any) => {
    console.log("handleRouteCalculated received:", route);
    console.log("coordenadas:", route.coordenadas?.length);

    if (!Array.isArray(route.coordenadas)) return;

    const latLngs: [number, number][] = route.coordenadas.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

    setRouteLine(latLngs);
  };






  // ======================================================
  // RENDER
  // ======================================================
  return (
    <main className={styles.main}>
      <HomeNavbar onToggleSidebar={() => setIsSidebarOpen((p) => !p)} />

      {/* SIDEBAR */}
<div style={{ position: "absolute", top: 85, left: "2.5%", zIndex: 2000 }}>
  <Sidebar
    isOpen={isSidebarOpen}
    onClose={() => setIsSidebarOpen(false)}
    onAddLocationClick={() => {
      setIsSidebarOpen(false);
      setShowPOIList(false);
      setSearchMode("coords");
      setTimeout(() => coordInputRef.current?.focus(), 100);
    }}
    onListLocationsClick={() => {
      setIsSidebarOpen(false);
      setShowPOIList(false);
      setTimeout(() => setShowPOIList(true), 0);
    }}
    onAddVehicleClick={() => {
      setIsSidebarOpen(false);
      setShowPOIList(false);
      setSelectedPOI(null);
      setBackendError(null);
      setShowVehicleCard(true);
    }}
    onListVehiclesClick={() => {
      setIsSidebarOpen(false);
      setShowVehicleList(true);
    }}
    onCalculateRouteClick={() => {
      // 🔥 NUEVO: selector de POIs
      setIsSidebarOpen(false);
      setShowPOIList(false);
      setShowVehicleList(false);
      setSelectedPOI(null);
      setBackendError(null);

      setShowRouteFromPOIs(true);
    }}
    onListRoutesClick={() => {
      setShowSavedRoutes(true);
      setIsSidebarOpen(false);
    }}
  />
</div>


      {/* ===== SELECTOR DE BÚSQUEDA (RESTAURADO) ===== */}
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
            Elige una opción
          </div>

          <div className={styles.searchButtons}>
            <button
              className={`${styles.searchBtn} ${
                searchMode === "coords" ? styles.active : ""
              }`}
              onClick={() => setSearchMode("coords")}
            >
              Por coordenadas
            </button>

            <button
              className={`${styles.searchBtn} ${
                searchMode === "toponym" ? styles.active : ""
              }`}
              onClick={() => setSearchMode("toponym")}
            >
              Por topónimo
            </button>
          </div>
        </div>

        {searchMode === "coords" ? (
          <CoordinateSearch
            onSearch={centerMap}
            onAdd={openPOIFromCoords}
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

      {/* MAPA */}
      <MapaPrincipal
        center={mapCenter}
        routeLine={routeLine}
        onMapClick={(lat, lng) =>
          setSelectedPoint({ lat, lng })
        }

      />
      {selectedPoint && (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 3000,
    }}
  >
    <MapPointActionsCard
      lat={selectedPoint.lat}
      lng={selectedPoint.lng}
      toponimo={selectedPoint.toponimo}
      onSavePOI={() => {
        openPOIFromCoords(
          selectedPoint.lat,
          selectedPoint.lng,
          selectedPoint.toponimo
        );
        setSelectedPoint(null);
      }}
      onSetOrigin={() => {
        setRouteOrigin(selectedPoint);
        setSelectedPoint(null);
      }}
      onSetDestination={() => {
        setRouteDestination(selectedPoint);
        setSelectedPoint(null);
      }}
      onClose={() => setSelectedPoint(null)}
    />
  </div>
)}



      {/* POI CARD */}
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
            onSave={handleSavePOI}
            onClose={() => {
              setSelectedPOI(null);
              setBackendError(null);
            }}
          />
        </div>
      )}

      {/* VEHICLE CARD */}
      {showVehicleCard && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3000,
          }}
        >
          <VehicleCard
            error={backendError}
            loading={isSaving}
            onSave={handleSaveVehicle}
            onClose={() => {
              setShowVehicleCard(false);
              setBackendError(null);
            }}
          />
        </div>
      )}

      {/* POI LIST */}
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
      {/* VEHICLE LIST */}
      {showVehicleList && (
      <div
        style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 3000,
    }}
      >
      <VehicleList
  onClose={() => setShowVehicleList(false)}
  onEditVehicle={(vehicle) => {
    setShowVehicleList(false);
    setVehicleToEdit(vehicle); 
  }}
/>
    </div>

    
    )}

    {vehicleToEdit && (
      <div
        style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 3000,
    }}
      >
  <VehicleCard
    vehicle={vehicleToEdit}
    loading={isSaving}
    error={backendError}
    onSave={(nombre, matricula, tipo, consumo, favorito) =>
      handleUpdateVehicle(vehicleToEdit.id, consumo)
    }
    onClose={() => {
      setVehicleToEdit(null);
      setBackendError(null);
    }}
  />
  </div>
)}

{showSavedRoutes && (
  <SavedRoutesCard
    onClose={() => setShowSavedRoutes(false)}
    onSelectRoute={(savedRoute) => {
      handleRouteCalculated(savedRoute.route);
      setShowSavedRoutes(false);
    }}
  />
)}



{routeOrigin && routeDestination && (
  <RouteCard
    origin={routeOrigin}
    destination={routeDestination}
    onCalculated={handleRouteCalculated}
    onClose={() => {
      setRouteOrigin(null);
      setRouteDestination(null);
    }}
  />
)}
{showRouteFromPOIs && (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 3000,
    }}
  >
    <RouteFromPOIsCard
      onClose={() => setShowRouteFromPOIs(false)}
      onConfirm={(origin, destination) => {
        // Reutiliza tu flujo actual: RouteCard se abre con estos estados
        setRouteOrigin(origin);
        setRouteDestination(destination);
        setShowRouteFromPOIs(false);
      }}
    />
  </div>
)}







      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </main>
  );
}
