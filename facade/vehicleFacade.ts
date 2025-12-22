import { createVehicle, fetchVehicles, deleteVehicle as deleteVehicleRequest } from "../lib/api";


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

export const vehicleFacade = {
  // =====================================================
  // HU09 – Registrar vehículo
  // =====================================================
  async registerVehicle(
    userEmail: string,
    nombre: string,
    matricula: string,
    tipo: "COMBUSTION" | "ELECTRICO",
    consumo: number
  ): Promise<FacadeResult<any>> {
    // Validación mínima (mismo estilo que POI)
    if (!userEmail) {
      return {
        ok: false,
        error: "Usuario no autenticado",
      };
    }

    const result = await createVehicle(
      userEmail,
      nombre,
      matricula,
      tipo,
      Number(consumo)
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
// HU10 – Listar vehículos
// =====================================================
async listVehicles(userEmail: string): Promise<FacadeResult<any[]>> {
  if (!userEmail) {
    return {
      ok: false,
      error: "Usuario no autenticado",
    };
  }

  const result = await fetchVehicles(userEmail);

  if (!result?.ok) {
    return errorResult(result);
  }

  const vehicles = Array.isArray(result.data)
    ? result.data
    : Object.keys(result)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => result[key]);

  return {
    ok: true,
    data: vehicles,
  };
},
// =====================================================
// HU11 – Eliminar vehículo
// =====================================================
async deleteVehicle(
  userEmail: string,
  vehicleId: string
): Promise<FacadeResult<true>> {
  if (!userEmail || !vehicleId) {
    return { ok: false, error: "Datos inválidos" };
  }

  const result = await deleteVehicleRequest(userEmail, vehicleId);

  if (!result?.ok) {
    return errorResult(result);
  }

  return { ok: true, data: true };
}


};

