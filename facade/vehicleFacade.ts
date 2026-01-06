import { createVehicle, fetchVehicles, deleteVehicle as deleteVehicleRequest, updateVehicle as updateVehicleRequest, toggleVehicleFavorite} from "../lib/api";


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
  nombre: string,
  matricula: string,
  tipo: "COMBUSTION" | "ELECTRICO",
  consumo: number,
  favorito: boolean
): Promise<FacadeResult<any>> {
  const result = await createVehicle(
    nombre,
    matricula,
    tipo,
    consumo,
    favorito
  );

  if (!result?.ok) {
    return errorResult(result);
  }

  return {
    ok: true,
    data: result.data,
  };
}
,

// =====================================================
// HU10 – Listar vehículos
// =====================================================
async listVehicles(): Promise<FacadeResult<any[]>> {
  const result = await fetchVehicles();

  if (!result?.ok) {
    return errorResult(result);
  }

  const vehicles = Array.isArray(result.data)
    ? result.data
    : [];

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
}, 

// =====================================================
// HU12 – Actualizar vehículo
// =====================================================
async updateVehicle(
  userEmail: string,
  vehicleId: string,
  consumo: number
): Promise<FacadeResult<true>> {
  if (!userEmail || !vehicleId) {
    return { ok: false, error: "Datos inválidos" };
  }

  const result = await updateVehicleRequest(
    userEmail,
    vehicleId,
    consumo
  );

  if (!result?.ok) {
    return errorResult(result);
  }

  return { ok: true, data: true };
},
// =====================================================
// HU20 – Marcar vehículo como favorito
// =====================================================
async toggleFavorite(vehicleId: string): Promise<FacadeResult<true>> {
  if (!vehicleId) {
    return { ok: false, error: "Datos inválidos" };
  }

  const result = await toggleVehicleFavorite(vehicleId);

  if (!result?.ok) {
    return errorResult(result);
  }

  return { ok: true, data: true };
}

};


