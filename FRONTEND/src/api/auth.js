import { api, storage } from "./client.js";

export async function login(username, password) {
  const data = await api.post("/api/auth/login", { username, password });
  if (!data?.token) throw new Error("No token received from server");
  storage.setToken(data.token);
  return data;
}

export function logout() {
  storage.clearToken();
}

export function isAuthed() {
  return Boolean(storage.getToken());
}
