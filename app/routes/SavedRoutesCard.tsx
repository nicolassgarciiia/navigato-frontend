"use client";

import { useEffect, useState } from "react";
import routeFacade from "@/facade/routeFacade";

interface Props {
  onClose: () => void;
  onSelectRoute: (route: any) => void;
}

export default function SavedRoutesCard({
  onClose,
  onSelectRoute,
}: Props) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    const res = await routeFacade.list();

    if (res.ok && Array.isArray(res.data)) {
    setRoutes(res.data);
    } else {
    setRoutes([]);
    setError(res.error ?? "Error al cargar rutas guardadas");
    }

    setLoading(false);
  }

  load();
}, []);


  async function handleDelete(name: string) {
    const res = await routeFacade.delete(name);

    if (!res.ok) {
        setError(res.error ?? "No se pudo eliminar la ruta");
        return;
    }

    setRoutes(prev => prev.filter(r => r.nombre !== name));
    }


  return (
    <div className="absolute bottom-6 left-6 bg-white w-96 rounded-xl shadow-lg p-4 space-y-3 z-50">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Rutas guardadas</h2>
        <button onClick={onClose}>✕</button>
      </div>

      {loading && <p className="text-sm">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && routes.length === 0 && (
        <p className="text-sm text-gray-500">
          No tienes rutas guardadas
        </p>
      )}

      <ul className="space-y-2">
        {routes.map((r) => (
          <li
            key={r.nombre}
            className="border rounded p-2 flex items-center gap-2"
            >
                <button
                    onClick={async () => {
                        const res = await routeFacade.toggleFavorite(r.nombre);
                        if (!res.ok) return;

                        setRoutes(prev =>
                        prev.map(route =>
                            route.nombre === r.nombre
                            ? { ...route, favorito: !route.favorito }
                            : route
                        )
                        );
                    }}
                    className="text-lg"
                    >
                    {r.favorito ? "⭐" : "☆"}
            </button>
            <button
              className="text-left text-sm flex-1"
              onClick={() => onSelectRoute(r)}
            >
              {r.nombre}
            </button>

            <button
              onClick={() => handleDelete(r.nombre)}
              className="text-red-500 text-xs ml-2"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
