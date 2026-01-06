"use client";

import { useEffect, useMemo, useState } from "react";
import authFacade from "@/facade/authFacade";
import { poiFacade } from "@/facade/poiFacade";

interface POI {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
}

export default function RouteFromPOIsCard({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => void;
}) {
  const [pois, setPois] = useState<POI[]>([]);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const correo = useMemo(() => {
    const user = authFacade.getUser();
    return typeof user === "string"
      ? JSON.parse(user)?.correo
      : user?.correo;
  }, []);

  useEffect(() => {
    async function loadPOIs() {
      if (!correo) return;
      const res = await poiFacade.listPOIs(correo);
      if (res.ok) setPois(res.data);
    }
    loadPOIs();
  }, [correo]);

  function handleConfirm() {
    const origin = pois.find((p) => p.id === originId);
    const dest = pois.find((p) => p.id === destinationId);

    if (!origin || !dest) {
      setError("Selecciona origen y destino");
      return;
    }

    onConfirm(
      { lat: origin.latitud, lng: origin.longitud },
      { lat: dest.latitud, lng: dest.longitud }
    );
  }

  return (
    <div className="absolute bottom-6 right-6 bg-white w-80 rounded-xl shadow-lg p-4 space-y-3 z-50">
      <div className="flex justify-between">
        <h2 className="font-semibold">Calcular ruta</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <select
        className="border p-2 w-full"
        value={originId}
        onChange={(e) => setOriginId(e.target.value)}
      >
        <option value="">📍 Origen</option>
        {pois.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <select
        className="border p-2 w-full"
        value={destinationId}
        onChange={(e) => setDestinationId(e.target.value)}
      >
        <option value="">🏁 Destino</option>
        {pois.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <button
        onClick={handleConfirm}
        className="bg-blue-600 text-white py-2 rounded w-full"
      >
        Continuar
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
