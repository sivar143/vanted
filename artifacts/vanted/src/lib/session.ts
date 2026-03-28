const SESSION_KEY = "vanted-session-id";

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
