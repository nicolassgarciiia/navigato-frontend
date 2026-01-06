import {
  fetchUserPreferences,
  setDefaultVehicle,
  setDefaultRouteType,
} from "@/lib/api";

const userPreferencesFacade = {
  async getPreferences() {
    const res = await fetchUserPreferences();

    if (!res?.ok) {
      return {
        ok: false,
        error: res?.error ?? "Error al cargar preferencias",
      };
    }

    // 🔥 CLAVE: request() NO devuelve res.data
    return {
      ok: true,
      data: {
        defaultVehicleId: res.defaultVehicleId ?? "",
        defaultRouteType: res.defaultRouteType ?? "economica",
      },
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
