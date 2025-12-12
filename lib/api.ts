const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Función central para peticiones HTTP.
 * Conecta con tu UserController y maneja los errores automáticamente.
 */
async function request(endpoint: string, options: RequestInit = {}) {
  // 1. Preparamos las cabeceras
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // 2. Inyectamos el Token si existe (Para rutas protegidas como delete/logout)
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
    
    // Intentamos leer el JSON. Si el servidor no devuelve JSON (ej. caída total), data será {}
    const data = await res.json().catch(() => ({}));

    // ============================================================
    // MANEJO DE ERRORES GLOBALES
    // ============================================================

    // CASO 1: SESIÓN EXPIRADA (Token inválido o caducado)
    // Si recibimos un 401 y NO estamos intentando loguearnos, es que la sesión caducó.
    if (res.status === 401 && !endpoint.includes("/login")) {
      if (typeof window !== "undefined") {
        console.warn("Sesión expirada. Cerrando sesión local...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        // Redirigir al login con un mensaje (opcional)
        window.location.href = "/login?error=session_expired";
        return { ok: false, error: "Tu sesión ha expirado. Inicia sesión de nuevo." };
      }
    }

    // CASO 2: ERROR DE NEGOCIO (400, 404, 409, 500)
    // Tu controlador devuelve: { statusCode: 400, message: "Contraseña débil...", ... }
    if (!res.ok) {
      return { 
        ok: false, 
        // Priorizamos el mensaje que mandaste desde el Controller
        error: data.message || `Error del servidor (${res.status})` 
      };
    }

    // ============================================================
    // ÉXITO (200, 201)
    // ============================================================
    
    // Si la respuesta es 204 No Content (a veces pasa en logout/delete)
    if (res.status === 204) return { ok: true };

    // Devolvemos ok: true y mezclamos los datos del backend (user, access_token, etc.)
    return { ok: true, ...data };

  } catch (error: any) {
    // CASO 3: ERROR DE RED (Servidor apagado, sin internet)
    console.error("Error de red:", error);
    return { ok: false, error: "No se pudo conectar con el servidor. Comprueba tu conexión." };
  }
}

// ====================================================================
// MÉTODOS PÚBLICOS (Conectados a tu UserController)
// ====================================================================

export async function registerUser(data: any) {
  // Apunta a @Controller("users") + @Post("register")
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(correo: string, contraseña: string) {
  // Apunta a @Controller("users") + @Post("login")
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify({ correo, contraseña }),
  });
}

export async function deleteAccount(correo: string) {
  // Apunta a @Controller("users") + @Post("delete")
  return request("/users/delete", {
    method: "POST", // Tu backend usa POST para borrar
    body: JSON.stringify({ correo }),
  });
}

// Opcional: Si necesitas logout manual contra el backend
export async function logoutUser(correo: string) {
    return request("/users/logout", {
        method: "POST",
        body: JSON.stringify({ correo }),
    });
}