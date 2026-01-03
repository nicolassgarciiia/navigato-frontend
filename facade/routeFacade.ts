import {
  calculateRoute,
  saveRoute,
  fetchSavedRoutes,
  deleteSavedRoute,
  calculateRouteFuelCost,
  calculateRouteCalories,
  calculateRouteByType,
} from "../lib/api";

import authFacade from "./authFacade";

export const routeFacade = {
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

  async save(name: string) {
    return saveRoute(name);
  },

  async list() {
    return fetchSavedRoutes();
  },

  async delete(name: string) {
    return deleteSavedRoute(name);
  },

  async fuelCost(vehicleId: string) {
    return calculateRouteFuelCost(vehicleId);
  },

  async calories() {
    return calculateRouteCalories();
  },

  async byType(origen: string, destino: string, tipo: string) {
    return calculateRouteByType(origen, destino, tipo);
  },
};

export default routeFacade;
