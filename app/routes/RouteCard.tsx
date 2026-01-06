"use client";

import { useState, useEffect } from "react";
import routeFacade from "@/facade/routeFacade";
import { vehicleFacade } from "@/facade/vehicleFacade";
import userPreferencesFacade from "@/facade/userPreferencesFacade";

interface Props {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onClose: () => void;
  onCalculated?: (route: any) => void;
}

interface Vehicle {
  id: string;
  nombre: string;
}

type RouteType = "rapida" | "corta" | "economica";

export default function RouteCard({
  origin,
  destination,
  onCalculated,
  onClose,
}: Props) {
  const [metodo, setMetodo] = useState("vehiculo");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [routeType, setRouteType] = useState<RouteType>("economica");
  const [routeName, setRouteName] = useState("");
  const [saving, setSaving] = useState(false);

  // ==================================================
  // INIT: vehículos + preferencias
  // ==================================================
  useEffect(() => {
    async function init() {
      // 1️⃣ Cargar vehículos
      const vRes = await vehicleFacade.listVehicles();
      if (vRes.ok && Array.isArray(vRes.data)) {
        setVehicles(vRes.data);
      }

      // 2️⃣ Cargar preferencias
      const pRes = await userPreferencesFacade.getPreferences();
      if (pRes.ok && pRes.data) {
        setRouteType(pRes.data.defaultRouteType ?? "economica");
        setSelectedVehicleId(pRes.data.defaultVehicleId ?? "");
      }
    }

    init();
  }, []);

  // ==================================================
  // Calcular ruta
  // ==================================================
  async function handleCalculate() {
    setError(null);
    setLoading(true);

    const res = await routeFacade.byType(
      origin,
      destination,
      metodo,
      routeType
    );

    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Error al calcular ruta");
      return;
    }

    setResult(res);
    onCalculated?.(res);
  }

  // ==================================================
  // Guardar ruta
  // ==================================================
  async function handleSave() {
    if (!routeName.trim()) {
      setError("Introduce un nombre para la ruta");
      return;
    }

    setSaving(true);
    const res = await routeFacade.save(routeName);
    setSaving(false);

    if (!res.ok) {
      setError(res.error ?? "Error al guardar ruta");
      return;
    }

    onClose();
  }

  // ==================================================
  // Helpers formato
  // ==================================================
  const km = result ? (result.distancia / 1000).toFixed(2) : null;
  const min = result ? Math.round(result.duracion / 60) : null;

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <div className="absolute bottom-6 right-6 bg-white w-80 rounded-xl shadow-lg p-4 space-y-3 z-50">
      <div className="flex justify-between">
        <h2 className="font-semibold">Calcular ruta</h2>
        <button onClick={onClose}>✕</button>
      </div>

      {/* MÉTODO */}
      <select
        className="border p-1 w-full"
        value={metodo}
        onChange={(e) => setMetodo(e.target.value)}
      >
        <option value="vehiculo">🚗 Vehículo</option>
        <option value="pie">🚶 A pie</option>
        <option value="bici">🚴 Bicicleta</option>
      </select>

      {/* VEHÍCULO */}
      {metodo === "vehiculo" && (
        <select
          className="border p-1 w-full"
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
        >
          <option value="">Selecciona vehículo</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
      )}

      {/* TIPO DE RUTA */}
      <select
        className="border p-1 w-full"
        value={routeType}
        onChange={(e) => setRouteType(e.target.value as RouteType)}
      >
        <option value="rapida">⚡ Rápida</option>
        <option value="corta">📏 Corta</option>
        <option value="economica">💰 Económica</option>
      </select>

      {/* CALCULAR */}
      <button
        onClick={handleCalculate}
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Calculando…" : "Calcular ruta"}
      </button>

      {/* RESULTADO */}
      {result && (
        <div className="text-sm">
          <p>📏 Distancia: {km} km</p>
          <p>⏱️ Duración: {min} min</p>
        </div>
      )}

      {/* GUARDAR */}
      {result && (
        <>
          <input
            className="border p-1 w-full"
            placeholder="Nombre de la ruta"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white py-2 rounded w-full"
          >
            {saving ? "Guardando…" : "Guardar ruta"}
          </button>
        </>
      )}

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
