import { fetchUserPreferences, setDefaultVehicle, setDefaultRouteType } from "@/lib/api";

const userPreferencesFacade = {
  async getPreferences() {
    const res = await fetchUserPreferences();

    if (!res?.ok) {
      return { ok: false, error: res?.error ?? "Error al cargar preferencias" };
    }

    return {
      ok: true,
      data: res.data, // ← AQUÍ está defaultVehicleId
    };
  },

  async setDefaultVehicle(vehicleId: string) {
    return setDefaultVehicle(vehicleId);
  },

  async setDefaultRouteType(routeType: "rapida" | "corta" | "economica") {
    return setDefaultRouteType(routeType);
  },
};

export default userPreferencesFacade;
