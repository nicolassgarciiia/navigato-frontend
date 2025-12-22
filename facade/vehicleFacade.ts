import { createVehicle } from "../lib/api";

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
};
