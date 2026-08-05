export const ACCESS_TOKEN_KEY = "access_token";
export const TOKEN_STORAGE_KEY = "token_storage";

export type TokenStorage = "local" | "session";

function storage(kind: TokenStorage): Storage | null {
  if (typeof window === "undefined") return null;
  return kind === "local" ? localStorage : sessionStorage;
}

export function getTokenStoragePreference(): TokenStorage {
  if (typeof window === "undefined") return "local";
  const value = localStorage.getItem(TOKEN_STORAGE_KEY);
  return value === "session" ? "session" : "local";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function setAccessToken(
  token: string,
  rememberDevice: boolean = true,
): void {
  const kind: TokenStorage = rememberDevice ? "local" : "session";
  clearAccessToken();
  localStorage.setItem(TOKEN_STORAGE_KEY, kind);
  storage(kind)?.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
