import {
  fetchSavedRoutes,
  deleteSavedRoute,
  calculateRouteFuelCost,
  calculateRouteCalories,
  calculateRouteByType,
  saveRoute,
  toggleRouteFavorite,
} from "../lib/api";

import authFacade from "./authFacade";

export const routeFacade = {
  // HU13
  async calculate(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    metodo: string
  ) {
    const token = authFacade.getToken();

    const res = await fetch("http://localhost:3001/routes/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        origen: origin,
        destino: destination,
        metodo,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message || "Error backend" };
    }

    return { ok: true, ...data };
  },

  
  // HU14
  async fuelCost(vehicleName: string) {
    return calculateRouteFuelCost(vehicleName);
  },
  
  // HU15
  async calories() {
    return calculateRouteCalories();
  },
  
  // HU16 (CORREGIDA)
  async byType(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  metodo: string,
  tipo: "rapida" | "corta" | "economica"
) {
  return calculateRouteByType(
    origin,
    destination,
    metodo,
    tipo
  );
},

  
  // HU17
  async save(nombre: string) {
    return saveRoute(nombre);
  },

  // HU18
  async list() {
    return fetchSavedRoutes();
  },

  // HU19
  async delete(name: string) {
    return deleteSavedRoute(name);
  },
  // HU20
  async toggleFavorite(name: string) {
    return toggleRouteFavorite(name);
  },
};

export default routeFacade;