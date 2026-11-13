/**
 * frontend/src/lib/auth.ts
 * JWT token helpers — store, read, and clear the clinic session token.
 */

const TOKEN_KEY = "clinicflow_token";
const CLINIC_KEY = "clinicflow_clinic";
const EMAIL_KEY = "clinicflow_pending_email";

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem(TOKEN_KEY);
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLINIC_KEY);
  }
}

export function setClinic(clinic: { id: number; name: string }) {
  if (typeof window !== "undefined")
    localStorage.setItem(CLINIC_KEY, JSON.stringify(clinic));
}

export function getClinic(): { id: number; name: string } | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(CLINIC_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}

export function setPendingEmail(email: string) {
  if (typeof window !== "undefined") sessionStorage.setItem(EMAIL_KEY, email);
}

export function getPendingEmail(): string | null {
  if (typeof window !== "undefined") return sessionStorage.getItem(EMAIL_KEY);
  return null;
}

export function clearPendingEmail() {
  if (typeof window !== "undefined") sessionStorage.removeItem(EMAIL_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

