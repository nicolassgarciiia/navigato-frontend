import { loginUser, registerUser, deleteAccount as apiDeleteAccount } from "../lib/api";

// --- FUNCIONES AUXILIARES PRIVADAS ---
function saveSession(accessToken: string, user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_info", JSON.stringify(user));
  }
}

function logoutLocal() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
  }
}

// --- FACADE PÚBLICO ---
export const authFacade = {
  
  // GETTERS
  getToken() {
    if (typeof window !== "undefined") return localStorage.getItem("access_token");
    return null;
  },

  getUser() {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user_info");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isLogged() {
    if (typeof window !== "undefined") return !!localStorage.getItem("access_token");
    return false;
  },

  // LOGIN
  async login(correo: string, contraseña: string) {
    // 1. Llamada a API (ya no lanza throw)
    const response = await loginUser(correo, contraseña);

    // 2. Si falló, devolvemos el error directo
    if (!response.ok) {
      return { ok: false, error: response.error };
    }

    // 3. Si éxito, guardamos sesión
    if (response.access_token) {
      saveSession(response.access_token, response.user);
      return { ok: true, user: response.user };
    } 
    
    return { ok: false, error: "Error desconocido: Token no recibido." };
  },

  // REGISTER
  async register(data: any) {
    const response = await registerUser(data);
    // Pasamos la respuesta tal cual (ok: true/false)
    return response;
  },

  // DELETE ACCOUNT
  async deleteAccount(correo: string) {
    const response = await apiDeleteAccount(correo);

    if (response.ok) {
      this.logout(); // Limpiamos sesión local si se borró con éxito
      return { ok: true };
    }

    return { ok: false, error: response.error };
  },

  // LOGOUT
  logout() {
    logoutLocal();
    if (typeof window !== "undefined") {
        window.location.href = "/";
    }
  },
};

export default authFacade;