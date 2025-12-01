const BASE_URL = "http://localhost:3000";

export async function registerUser(data: any) {
  try {
    const res = await fetch(`${BASE_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

export async function loginUser(correo: string, contraseña: string) {
  try {
    const res = await fetch(`${BASE_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contraseña }),
    });

    return await res.json();
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}
