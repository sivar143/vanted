const SESSION_KEY = "vanted-session-id";
const USER_TOKEN_KEY = "user-token";
const USER_INFO_KEY = "user-info";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin-token");
}

export function getAdminAuthHeaders() {
  const token = getAdminToken();
  return token ? { "x-admin-token": token } : {};
}

export interface UserInfo {
  userId: number;
  email: string;
  username: string;
}

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getUserInfo(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function setUserSession(token: string, info: UserInfo): void {
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
}

export function clearUserSession(): void {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

export function getUserAuthHeaders() {
  const token = getUserToken();
  return token ? { "x-user-token": token } : {};
}

export function isUserLoggedIn(): boolean {
  return getUserToken() !== null;
}
