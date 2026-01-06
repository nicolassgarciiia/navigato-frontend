"use client";

import { useEffect, useState } from "react";
import { vehicleFacade } from "@/facade/vehicleFacade";
import userPreferencesFacade from "@/facade/userPreferencesFacade";

interface Vehicle {
  id: string;
  nombre: string;
}

type RouteType = "rapida" | "corta" | "economica";

export default function RoutePreferencesCard({
  onClose,
}: {
  onClose: () => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [defaultVehicle, setDefaultVehicle] = useState<string>("");
  const [defaultRouteType, setDefaultRouteType] =
    useState<RouteType>("economica");

  // 1️⃣ Cargar vehículos
  useEffect(() => {
    async function loadVehicles() {
      const res = await vehicleFacade.listVehicles();
      if (res.ok && Array.isArray(res.data)) {
        setVehicles(res.data);
      }
    }

    loadVehicles();
  }, []);

  // 2️⃣ Cargar preferencias guardadas
  useEffect(() => {
    async function loadPreferences() {
      const res = await userPreferencesFacade.getPreferences();

      if (res.ok && res.data) {
        setDefaultVehicle(res.data.defaultVehicleId);
        setDefaultRouteType(res.data.defaultRouteType);
      }
    }

    loadPreferences();
  }, []);

  async function saveVehicle() {
    if (!defaultVehicle) return;
    await userPreferencesFacade.setDefaultVehicle(defaultVehicle);
  }

  async function saveRouteType() {
    await userPreferencesFacade.setDefaultRouteType(defaultRouteType);
  }

  return (
    <div className="absolute bottom-6 left-6 bg-white w-96 rounded-xl shadow-lg p-4 space-y-4 z-50">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-sm">Preferencias de ruta</h2>
        <button onClick={onClose}>✕</button>
      </div>

      {/* VEHÍCULO POR DEFECTO */}
      <div className="space-y-2">
        <p className="text-xs font-medium">Vehículo por defecto</p>
        <select
          className="border rounded px-2 py-1 w-full text-sm"
          value={defaultVehicle}
          onChange={(e) => setDefaultVehicle(e.target.value)}
        >
          <option value="">Selecciona un vehículo</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={saveVehicle}
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded w-full"
        >
          Guardar vehículo por defecto
        </button>
      </div>

      {/* TIPO DE RUTA POR DEFECTO */}
      <div className="space-y-2">
        <p className="text-xs font-medium">Tipo de ruta por defecto</p>
        <select
          className="border rounded px-2 py-1 w-full text-sm"
          value={defaultRouteType}
          onChange={(e) =>
            setDefaultRouteType(e.target.value as RouteType)
          }
        >
          <option value="rapida">🚀 Más rápida</option>
          <option value="corta">📏 Más corta</option>
          <option value="economica">💰 Más económica</option>
        </select>

        <button
          onClick={saveRouteType}
          className="bg-green-600 text-white text-sm px-3 py-1 rounded w-full"
        >
          Guardar tipo de ruta
        </button>
      </div>
    </div>
  );
}
