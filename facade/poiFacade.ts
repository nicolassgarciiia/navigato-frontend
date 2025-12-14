import { createPOI, getToponimo } from "../lib/api";

export const poiFacade = {
  async fetchLocationDetails(lat: number, lng: number) {
    const result = await getToponimo(Number(lat), Number(lng));

    if (result.ok) {
      const direccionTexto =
        result.features?.[0]?.properties?.label ||
        result.display_name ||
        result.toponimo ||
        "Ubicación sin nombre";

      return {
        ok: true,
        toponimo: direccionTexto,
      };
    }

    return {
      ok: false,
      error: result.error,
      code: result.code,
      status: result.status,
    };
  },

  async registerPOI(
    userEmail: string,
    nombre: string,
    latitud: number,
    longitud: number
  ) {
    const result = await createPOI(
      userEmail,
      nombre,
      Number(latitud),
      Number(longitud)
    );

    if (result.ok) {
      return {
        ok: true,
        poi: result,
      };
    }

    return {
      ok: false,
      error: result.error,
      code: result.code,
      status: result.status,
    };
  },
};
