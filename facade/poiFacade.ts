import {
  createPOI,
  getToponimo,
  fetchPOIs,
  deletePOI as deletePOIRequest,
  togglePoiFavorite,
} from "../lib/api";

type FacadeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number; code?: string };

function errorResult(result: any): FacadeResult<never> {
  return {
    ok: false,
    error: result?.error || "Error inesperado",
    status: result?.status,
    code: result?.code,
  };
}

export const poiFacade = {
  // =====================================================
  // HU05 – Obtener topónimo desde coordenadas
  // =====================================================
  async fetchLocationDetails(
    lat: number,
    lng: number
  ): Promise<FacadeResult<{ toponimo: string }>> {
    const result = await getToponimo(Number(lat), Number(lng));

    if (!result?.ok) {
      return errorResult(result);
    }

    const toponimo =
      result.features?.[0]?.properties?.label ||
      result.display_name ||
      result.toponimo ||
      "Ubicación sin nombre";

    return {
      ok: true,
      data: { toponimo },
    };
  },

  // =====================================================
  // HU05 – Registrar POI
  // =====================================================
  async registerPOI(
    userEmail: string,
    nombre: string,
    latitud: number,
    longitud: number
  ): Promise<FacadeResult<any>> {
    const result = await createPOI(
      userEmail,
      nombre,
      Number(latitud),
      Number(longitud)
    );

    if (!result?.ok) {
      return errorResult(result);
    }

    return {
      ok: true,
      data: result,
    };
  },

  // =====================================================
  // HU07 – Listar POIs
  // =====================================================
  async listPOIs(userEmail: string): Promise<FacadeResult<any[]>> {
    if (!userEmail) {
      return {
        ok: false,
        error: "Usuario no autenticado",
      };
    }

    const result = await fetchPOIs(userEmail);

    if (!result?.ok) {
      return errorResult(result);
    }

    // Si fetchPOIs devuelve directamente un array, mejor aún
    const pois = Array.isArray(result.data)
      ? result.data
      : Object.keys(result)
          .filter((key) => !isNaN(Number(key)))
          .map((key) => result[key]);

    return {
      ok: true,
      data: pois,
    };
  },

  // =====================================================
  // HU08 – Eliminar POI
  // =====================================================
  async deletePOI(
    userEmail: string,
    poiId: string
  ): Promise<FacadeResult<true>> {
    if (!userEmail || !poiId) {
      return {
        ok: false,
        error: "Datos inválidos",
      };
    }

    const result = await deletePOIRequest(userEmail, poiId);

    if (!result?.ok) {
      return errorResult(result);
    }

    return {
      ok: true,
      data: true,
    };
  },


async toggleFavoritePOI(poiId: string, correo: string) {
  return togglePoiFavorite(poiId, correo);
}, 

};

