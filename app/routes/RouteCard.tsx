"use client";

import { useState, useEffect } from "react";
import routeFacade from "@/facade/routeFacade";
import { vehicleFacade } from "@/facade/vehicleFacade";
import authFacade from "@/facade/authFacade";


interface Props {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onClose: () => void;
  onCalculated?: (route: any) => void;
}

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
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState<"rapida" | "corta" | "economica">("corta");
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [fuelCost, setFuelCost] = useState<number | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);
  const [fuelLiters, setFuelLiters] = useState<number | null>(null);
  const [calorieCost, setCalorieCost] = useState<number | null>(null);
  const [loadingCalories, setLoadingCalories] = useState(false);



  useEffect(() => {
  async function loadVehicles() {
    const user = authFacade.getUser();
    if (!user?.correo) return;

    const res = await vehicleFacade.listVehicles();
    if (res.ok && Array.isArray(res.data)) {
      setVehicles(res.data);
    }
  }

  loadVehicles();
}, []);


  async function handleCalculate() {
    setError(null);
    setResult(null);
    setFuelCost(null);
    setLoading(true);

    // 1 Calcular ruta
    const res = await routeFacade.calculate(origin, destination, metodo);

    if (!res.ok) {
      setLoading(false);
      setError(res.error ?? "Error al calcular ruta");
      return;
    }

    setResult(res);
    onCalculated?.(res);

    setLoading(false);
  }

  async function handleCalculateFuelCost() {
    if (!selectedVehicle) {
      setError("Selecciona un vehículo");
      return;
    }

    setLoadingCost(true);
    setError(null);

    const res = await routeFacade.fuelCost(selectedVehicle);
    console.log(res);

    setLoadingCost(false);
    
    if (!res.ok) {
      setError(res.error ?? "Error al calcular el coste");
      return;
    }
    
    setFuelCost(res.costeEconomico);
    setFuelLiters(res.costeEnergetico?.valor ?? null);
  }
  
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

async function handleCalculateByType() {
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
    setError(res.error ?? "Error al recalcular ruta");
    return;
  }
  setResult(res);
  onCalculated?.(res);
}




  async function handleSave() {
  if (!routeName.trim()) {
    setError("Introduce un nombre para la ruta");
    return;
  }

  setSaving(true);
  setError(null);

  const res = await routeFacade.save(routeName);

  setSaving(false);

  if (!res.ok) {
    setError(res.error ?? "Error al guardar la ruta");
    return;
  }

  // UX limpia
  setRouteName("");
  onClose();
}


 return (
  <div className="absolute bottom-6 right-6 bg-white w-80 rounded-xl shadow-lg p-4 space-y-3 z-50">
    {/* HEADER */}
    <div className="flex justify-between items-center">
      <h2 className="text-md font-semibold text-gray-800">
        Calcular ruta
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>

    {/* ORIGEN / DESTINO */}
    <div className="text-sm text-gray-800 space-y-1">
      <div>
        <strong>Origen:</strong>{" "}
        {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
      </div>
      <div>
        <strong>Destino:</strong>{" "}
        {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
      </div>
    </div>

    {/* MÉTODO */}
    <select
      className="border rounded px-2 py-1 w-full text-sm"
      value={metodo}
      onChange={(e) => setMetodo(e.target.value)}
    >
      <option value="vehiculo">🚗 Vehículo</option>
      <option value="pie">🚶 A pie</option>
      <option value="bici">🚴 Bicicleta</option>
    </select>

    {/* CALCULAR RUTA */}
    <button
      onClick={handleCalculate}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded w-full disabled:opacity-50"
    >
      {loading ? "Calculando..." : "Calcular ruta"}
    </button>

    {/* RESULTADO DE LA RUTA */}
    {result && (
      <div className="text-md text-gray-800 space-y-1">
        <p>📏 Distancia: {result.distancia} m</p>
        <p>⏱️ Duración: {result.duracion} s</p>
      </div>
    )}

    {/* VEHÍCULO + COSTE (HU14) */}
    {result && metodo === "vehiculo" && (
      <>
        <select
          className="border rounded px-2 py-1 w-full text-sm"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
        >
          <option value="">Selecciona un vehículo</option>
          {vehicles.map((v: any) => (
            <option key={v.id} value={v.nombre}>
              {v.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={handleCalculateFuelCost}
          disabled={loadingCost || !selectedVehicle}
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-2 rounded w-full disabled:opacity-50"
        >
          {loadingCost ? "Calculando coste..." : "Calcular coste"}
        </button>
      </>
    )}

    {/* COSTE */}
    {fuelCost !== null && (
      <>
      <p className="text-md text-gray-800">
        ⛽ Coste estimado: <strong>{fuelCost} €</strong>
      </p>
      <p className="text-md text-gray-800">
        🛢️ Consumo estimado: <strong>{fuelLiters} L</strong>
      </p>
      </>
    )}

    {/* BICI/A PIE + COSTE CALORICO (HU15) */}
    {result && (metodo === "pie" || metodo === "bici") && (
      <>
        <button
          onClick={handleCalculateCalories}
          disabled={loadingCalories}
          className="bg-orange-600 text-white text-sm px-3 py-2 rounded w-full"
        >
          {loadingCalories ? "Calculando..." : "Calcular coste calórico"}
        </button>

        {calorieCost !== null && (
          <p className="text-md text-gray-800">
            🔥 Coste calórico: <strong>{calorieCost} kcal</strong>
          </p>
        )}
      </>
    )}

    {result && (
  <select
    className="border rounded px-2 py-1 w-full text-sm"
    value={routeType}
    onChange={(e) => setRouteType(e.target.value as any)}
  >
    <option value="rapida">⚡ Rápida</option>
    <option value="corta">📏 Corta</option>
    <option value="economica">💰 Económica</option>
  </select>
)}

<button
  onClick={handleCalculateByType}
  className="bg-purple-600 text-white text-sm px-3 py-2 rounded w-full"
>
  Recalcular por tipo
</button>



    {/* ERROR */}
    {error && (
      <p className="text-xs text-red-600">{error}</p>
    )}

    {/* GUARDAR RUTA */}
    {result && (
      <>
        <input
          placeholder="Nombre de la ruta"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="border p-2 w-full text-sm"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded w-full disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar ruta"}
        </button>
      </>
    )}
  </div>
)};
