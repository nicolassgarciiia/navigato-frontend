import { loginUser, registerUser, deleteAccount as apiDeleteAccount } from "../lib/api";

// --- TIPOS ---
interface User {
  [key: string]: any;
}

interface AuthResponse {
  ok: boolean;
  user?: User;
  error?: string;
  needsVerification?: boolean; 
}

const isBrowser = typeof window !== "undefined";

function saveSession(accessToken: string, user: User) {
  if (isBrowser) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_info", JSON.stringify(user));
  }
}

function logoutLocal() {
  if (isBrowser) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
  }
}

export const authFacade = {
  
  // ... (Getters se mantienen igual) ...
  getToken(): string | null {
    if (isBrowser) return localStorage.getItem("access_token");
    return null;
  },

  getUser(): User | null {
    if (isBrowser) {
      const userStr = localStorage.getItem("user_info");
      if (!userStr) return null;
      try {
        return JSON.parse(userStr);
      } catch (e) {
        logoutLocal(); 
        return null;
      }
    }
    return null;
  },

  isLogged(): boolean {
    if (isBrowser) return !!localStorage.getItem("access_token");
    return false;
  },


  async login(correo: string, contraseña: string): Promise<AuthResponse> {
    try {
      const response = await loginUser(correo, contraseña);

      if (!response.ok) {
        

        const errorMsg = response.error || "";
        const isNotVerified = errorMsg.includes("verify") || errorMsg.includes("verificado") || errorMsg === "EMAIL_NOT_VERIFIED";

        if (isNotVerified) {
            return { 
                ok: false, 
                error: "Debes verificar tu correo electrónico antes de entrar.",
                needsVerification: true 
            };
        }

        return { ok: false, error: errorMsg || "Credenciales incorrectas" };
      }

      // CASO ÉXITO
      if (response.access_token) {
        saveSession(response.access_token, response.user);
        return { ok: true, user: response.user };
      } 
      
      return { ok: false, error: "Error desconocido: Token no recibido." };

    } catch (error) {
      return { ok: false, error: "Error de conexión." };
    }
  },


  async register(data: any): Promise<AuthResponse> {
    try {
        return await registerUser(data);
    } catch (error) {
        return { ok: false, error: "Error de conexión." };
    }
  },

  async deleteAccount(correo: string): Promise<AuthResponse> {
    try {
        const response = await apiDeleteAccount(correo);
        if (response.ok) {
          authFacade.logout(); 
          return { ok: true };
        }
        return { ok: false, error: response.error };
    } catch (error) {
        return { ok: false, error: "Error al eliminar cuenta." };
    }
  },

  logout() {
    logoutLocal();
    if (isBrowser) window.location.href = "/";
  },
};

export default authFacade;