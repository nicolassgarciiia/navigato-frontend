"use client";

import { useState } from "react";
import routeFacade from "@/facade/routeFacade";

interface Props {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onClose: () => void;
}

export default function RouteCard({
  origin,
  destination,
  onClose,
}: Props) {
  const [metodo, setMetodo] = useState("vehiculo");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setError(null);
    setResult(null);
    setLoading(true);

    const res = await routeFacade.calculate(origin, destination, metodo);

    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Error al calcular ruta");
      return;
    }

    setResult(res);
  }

  return (
    <div className="absolute bottom-6 right-6 bg-white w-80 rounded-xl shadow-lg p-4 space-y-3 z-50">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-800">
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
      <div className="text-xs text-gray-600 space-y-1">
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

      {/* BOTÓN */}
      <button
        onClick={handleCalculate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded w-full disabled:opacity-50"
      >
        {loading ? "Calculando..." : "Calcular ruta"}
      </button>

      {/* ERROR */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* RESULTADO */}
      {result && (
        <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
          <div>
            <strong>Distancia:</strong>{" "}
            {result.distancia ?? "—"}
          </div>
          <div>
            <strong>Duración:</strong>{" "}
            {result.duracion ?? "—"}
          </div>
        </div>
      )}
    </div>
  );
}
