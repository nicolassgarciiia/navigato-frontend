"use client";

import { useState, useEffect, useMemo } from "react";
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
  // ==================================================
  // ESTADO GENERAL
  // ==================================================
  const [metodo, setMetodo] = useState("vehiculo");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // VEHÍCULOS + PREFS
  // ==================================================
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [routeType, setRouteType] = useState<RouteType>("economica");

  // 🔑 CLAVE: ID → NOMBRE
  const selectedVehicleName = useMemo(
    () => vehicles.find(v => v.id === selectedVehicleId)?.nombre ?? "",
    [vehicles, selectedVehicleId]
  );

  // ==================================================
  // COSTES
  // ==================================================
  const [fuelCost, setFuelCost] = useState<number | null>(null);
  const [fuelLiters, setFuelLiters] = useState<number | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);

  const [calorieCost, setCalorieCost] = useState<number | null>(null);
  const [loadingCalories, setLoadingCalories] = useState(false);

  // ==================================================
  // GUARDAR
  // ==================================================
  const [routeName, setRouteName] = useState("");
  const [saving, setSaving] = useState(false);

  // ==================================================
  // INIT
  // ==================================================
  useEffect(() => {
    async function init() {
      const vRes = await vehicleFacade.listVehicles();
      if (vRes.ok && Array.isArray(vRes.data)) {
        setVehicles(vRes.data);
      }

      const pRes = await userPreferencesFacade.getPreferences();
      if (pRes.ok && pRes.data) {
        setRouteType(pRes.data.defaultRouteType ?? "economica");
        setSelectedVehicleId(pRes.data.defaultVehicleId ?? "");
      }
    }
    init();
  }, []);

  // ==================================================
  // CALCULAR RUTA
  // ==================================================
  async function handleCalculate() {
    setError(null);
    setLoading(true);

    // reset costes
    setFuelCost(null);
    setFuelLiters(null);
    setCalorieCost(null);

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
  // COSTE VEHÍCULO (HU14)
  // ==================================================
  async function handleCalculateFuelCost() {
    if (!selectedVehicleName) {
      setError("Selecciona un vehículo");
      return;
    }

    setLoadingCost(true);
    setError(null);

    const res = await routeFacade.fuelCost(selectedVehicleName);

    setLoadingCost(false);

    if (!res.ok) {
      setError(res.error ?? "Error al calcular coste");
      return;
    }

    setFuelCost(res.costeEconomico ?? null);
    setFuelLiters(res.costeEnergetico?.valor ?? null);
  }

  // ==================================================
  // COSTE CALÓRICO (HU15)
  // ==================================================
  async function handleCalculateCalories() {
    setLoadingCalories(true);
    setError(null);

    const res = await routeFacade.calories();

    setLoadingCalories(false);

    if (!res.ok) {
      setError(res.error ?? "Error al calcular coste calórico");
      return;
    }

    const kcal = res.costeEnergetico?.valor;
    if (typeof kcal === "number") {
      setCalorieCost(kcal);
    } else {
      setError("Respuesta de coste calórico inválida");
    }
  }

  // ==================================================
  // GUARDAR RUTA
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
  // FORMATOS
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

      {/* TIPO RUTA */}
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
        className="bg-blue-600 text-white py-2 rounded w-full"
      >
        {loading ? "Calculando…" : "Calcular ruta"}
      </button>

      {/* RESULTADO */}
      {result && (
        <div className="text-sm space-y-1">
          <p>📏 Distancia: {km} km</p>
          <p>⏱️ Duración: {min} min</p>
        </div>
      )}

      {/* COSTE VEHÍCULO */}
      {result && metodo === "vehiculo" && (
        <>
          <button
            onClick={handleCalculateFuelCost}
            disabled={loadingCost || !selectedVehicleName}
            className="bg-amber-600 text-white py-2 rounded w-full"
          >
            {loadingCost ? "Calculando coste…" : "Calcular coste"}
          </button>

          {fuelCost !== null && (
            <>
              <p>⛽ Coste estimado: <strong>{fuelCost} €</strong></p>
              <p>🛢️ Consumo estimado: <strong>{fuelLiters} L</strong></p>
            </>
          )}
        </>
      )}

      {/* COSTE CALÓRICO */}
      {result && (metodo === "pie" || metodo === "bici") && (
        <>
          <button
            onClick={handleCalculateCalories}
            disabled={loadingCalories}
            className="bg-orange-600 text-white py-2 rounded w-full"
          >
            {loadingCalories ? "Calculando…" : "Calcular coste calórico"}
          </button>

          {calorieCost !== null && (
            <p>🔥 Coste calórico: <strong>{calorieCost} kcal</strong></p>
          )}
        </>
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
