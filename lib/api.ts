const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


export interface RegisterPayload {
  nombre: string;
  apellidos: string;
  correo: string;
  contraseña: string;
  repetirContraseña: string;
  aceptaPoliticaPrivacidad: boolean;
}


async function request(endpoint: string, options: RequestInit = {}) {

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };


  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    

    const data = await res.json().catch(() => ({}));

    // ============================================================
    // MANEJO DE ERRORES GLOBALES
    // ============================================================


    if (res.status === 401 && !endpoint.includes("/login")) {
      if (typeof window !== "undefined") {
        console.warn("Sesión expirada. Cerrando sesión local...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        window.location.href = "/login?error=session_expired";
        return { ok: false, error: "Tu sesión ha expirado. Inicia sesión de nuevo." };
      }
    }

    // CASO 2: ERROR DE NEGOCIO (Devuelto por NestJS)
    if (!res.ok) {
      return { 
        ok: false, 
        error: data.message || `Error del servidor (${res.status})` 
      };
    }

    // ============================================================
    // ÉXITO
    // ============================================================
    if (res.status === 204) return { ok: true };

    return { ok: true, ...data };

  } catch (error: any) {
    // CASO 3: ERROR DE RED
    console.error("Error de red:", error);
    return { ok: false, error: "No se pudo conectar con el servidor. Comprueba tu conexión." };
  }
}

// ====================================================================
// MÉTODOS PÚBLICOS
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