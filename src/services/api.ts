import { Module, HistoryEntry, ProfileSettings } from "../types";

export interface ApiUser {
  uid: string;
  email: string;
  displayName: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  return body as T;
}

export const api = {
  signup(email: string, password: string, name: string) {
    return request<{ user: ApiUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  login(email: string, password: string) {
    return request<{ user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return request<{ ok: true }>("/auth/logout", { method: "POST" });
  },

  me() {
    return request<{ user: ApiUser }>("/auth/me");
  },

  forgotPassword(email: string) {
    return request<{ message: string; devNote?: string; resetLink?: string }>(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email }) }
    );
  },

  resetPassword(token: string, password: string) {
    return request<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request<{ ok: true }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  deleteAccount(password: string) {
    return request<{ ok: true }>("/auth/delete-account", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  getData() {
    return request<{ modules: Module[] | null; history: HistoryEntry[] | null; settings: ProfileSettings | null }>(
      "/data"
    );
  },

  saveData(modules: Module[], history: HistoryEntry[], settings: ProfileSettings) {
    return request<{ ok: true }>("/data", {
      method: "PUT",
      body: JSON.stringify({ modules, history, settings }),
    });
  },
};
