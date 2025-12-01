const API_URL = "http://localhost:3001";

const authFacade = {
  saveUser(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  logoutLocal() {
    localStorage.removeItem("user");
  },

  isLogged() {
    return localStorage.getItem("user") !== null;
  },

  //----------------------------------------------------
  // CALLS AL BACKEND
  //----------------------------------------------------
  async login(correo: string, contraseña: string) {
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      const json = await res.json();

      if (json.ok && json.user) {
        this.saveUser(json.user);
      }

      return json;
    } catch {
      return { ok: false, error: "Error de conexión" };
    }
  },

  async register(data: any) {
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.ok && json.user) {
        this.saveUser(json.user);
      }

      return json;
    } catch {
      return { ok: false, error: "Error de conexión" };
    }
  },

  async logout() {
    const user = this.getUser();
    if (!user) return;

    try {
      await fetch(`${API_URL}/users/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: user.correo }),
      });
    } catch (_) {}

    this.logoutLocal();
  },
};

export default authFacade;
