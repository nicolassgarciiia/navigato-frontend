const sessionFacade = {
  isLogged() {
    if (typeof window === "undefined") return false;

    const raw = localStorage.getItem("user");
    if (!raw) return false;

    try {
      const user = JSON.parse(raw);
      return user && typeof user === "object" && user.sesion_activa === true;
    } catch {
      return false;
    }
  },

  saveUser(user: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser() {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
  },
};

export default sessionFacade;
