const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ====================================================================
// INTERFACES DE DATOS
// ====================================================================

export interface RegisterPayload {
  nombre: string;
  apellidos: string;
  correo: string;
  contraseña: string;
  repetirContraseña: string;
  aceptaPoliticaPrivacidad: boolean;
}

interface ApiResponse {
  ok: boolean;
  error?: string;
  status?: number;
  code?: string;
  [key: string]: any;
}

// ====================================================================
// UTILIDAD PARA EXTRAER MENSAJES DE ERROR (NestJS friendly)
// ====================================================================

function extractErrorMessage(data: any): string {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.message?.message === "string") {
    return data.message.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return "Error inesperado";
}

// ====================================================================
// FUNCIÓN GENÉRICA DE PETICIÓN
// ====================================================================

async function request(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // --------------------------------------------------
  // Gestión de token
  // --------------------------------------------------
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    // --------------------------------------------------
    // 401 – Sesión expirada
    // --------------------------------------------------
    if (res.status === 401 && !endpoint.includes("/login")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        window.location.href = "/login?error=session_expired";
      }

      return {
        ok: false,
        status: 401,
        code: "AuthenticationRequiredError",
        error: "Tu sesión ha expirado. Inicia sesión de nuevo.",
      };
    }

    // --------------------------------------------------
    // Errores de negocio / validación
    // --------------------------------------------------
    if (!res.ok) {
      const message = extractErrorMessage(data);

      return {
        ok: false,
        status: res.status,
        code:
          typeof data?.message === "string"
            ? data.message
            : undefined,
        error: message,
      };
    }

    // --------------------------------------------------
    // Éxito sin contenido
    // --------------------------------------------------
    if (res.status === 204) {
      return { ok: true };
    }

    // --------------------------------------------------
    // Éxito con datos
    // --------------------------------------------------
    return { ok: true, ...data };
  } catch (error) {
    console.error("Error de red:", error);
    return {
      ok: false,
      status: 0,
      error:
        "No se pudo conectar con el servidor. Comprueba tu conexión.",
    };
  }
}

// ====================================================================
// MÉTODOS DE USUARIO (NO TOCAR)
// ====================================================================

export async function registerUser(data: RegisterPayload) {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(correo: string, contraseña: string) {
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify({ correo, contraseña }),
  });
}

export async function deleteAccount(correo: string) {
  return request("/users/delete", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
}

export async function logoutUser(correo: string) {
  return request("/users/logout", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
}

// ====================================================================
// HU05 – PUNTOS DE INTERÉS
// ====================================================================

export async function createPOI(
  userEmail: string,
  nombre: string,
  latitud: number,
  longitud: number
) {
  return request("/pois", {
    method: "POST",
    body: JSON.stringify({
      correo: userEmail,
      nombre,
      latitud: Number(latitud),
      longitud: Number(longitud),
    }),
  });
}

export async function getToponimo(lat: number, lng: number) {
  return request(`/geocoding/reverse?lat=${lat}&lng=${lng}`, {
    method: "GET",
  });
}
export async function getCoordinatesFromToponym(toponimo: string) {
  return request(
    `/geocoding/search?q=${encodeURIComponent(toponimo)}`,
    { method: "GET" }
  );
}
export async function fetchPOIs(userEmail: string) {
  return request(`/pois?correo=${encodeURIComponent(userEmail)}`, {
    method: "GET",
    cache: "no-store",
  });
}






