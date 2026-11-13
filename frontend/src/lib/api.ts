/**
 * frontend/src/lib/api.ts
 * Central API client for all backend calls.
 * Automatically injects JWT Bearer token and handles errors uniformly.
 */

import { getToken, clearToken } from "./auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-logout on 401
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const rawText = await res.text();
  let json: ApiResponse<T>;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(
      `Cannot connect to backend API (received HTML instead of JSON from ${BASE_URL}${path}). Make sure the backend server is running (cd backend && node server.js).`
    );
  }

  if (!json.ok) {
    const errPayload = (json as any).error;
    const msg =
      typeof errPayload === "string"
        ? errPayload
        : errPayload?.message ||
          (json as any).message ||
          "Something went wrong";
    throw new Error(msg);
  }

  return (json as { ok: true; data: T }).data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone: string;
    clinic_type?: string;
  }) => request<{ id: number; name: string; email: string }>("POST", "/auth/register", body),

  login: (body: { email: string; password: string }) =>
    request<{ message: string; dev_otp?: string }>("POST", "/auth/login", body),

  verifyOtp: (body: { email: string; otp: string }) =>
    request<{ token: string; clinic: { id: number; name: string } }>(
      "POST",
      "/auth/verify-otp",
      body
    ),
};

// ─── Patients ─────────────────────────────────────────────────────────────────

export const patientsApi = {
  list: (search = "") =>
    request<Patient[]>("GET", `/patients?search=${encodeURIComponent(search)}`),

  get: (id: number | string) =>
    request<PatientWithVisits>("GET", `/patients/${id}`),

  create: (body: {
    name: string;
    phone?: string;
    age?: number;
    gender?: string;
  }) => request<Patient>("POST", "/patients", body),
};

// ─── Visits ───────────────────────────────────────────────────────────────────

export const visitsApi = {
  create: (body: {
    patient_id: string | number;
    problem: string;
    diagnosis_or_solution: string;
    medicines: string[];
    advice?: string;
    charges: number;
    payment_mode: "cash" | "online";
    follow_up_date?: string | null;
  }) => request<Visit>("POST", "/visits", body),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => request<DashboardStats>("GET", "/dashboard/stats"),
};

// ─── Revenue ──────────────────────────────────────────────────────────────────

export const revenueApi = {
  summary: () => request<RevenueSummary>("GET", "/revenue/summary"),
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventoryApi = {
  // Returns { data: items[], aiInsight } — handled by inventory page directly
  listRaw: () =>
    fetch(
      `${BASE_URL}/inventory`,
      { headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } }
    ).then((r) => r.json()),

  list: () => request<InventoryItem[]>("GET", "/inventory"),
  create: (body: {
    name: string;
    category: string;
    unit: string;
    quantity: number;
    threshold: number;
  }) => request<InventoryItem>("POST", "/inventory", body),
  updateQty: (id: number, quantity: number) =>
    request<InventoryItem>("PATCH", `/inventory/${id}`, { quantity }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────

const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:5001";

export const aiApi = {
  draftVisit: async (notes: string): Promise<AiVisitDraft> => {
    const res = await fetch(`${AI_URL}/api/ai/draft-visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const json = await res.json();
    return json.data as AiVisitDraft;
  },
};

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Patient {
  id: number;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  created_at: string;
}

export interface Visit {
  id: number;
  patient_id: number;
  visit_date: string;
  problem: string | null;
  diagnosis_or_solution: string | null;
  medicines: string[];
  advice: string | null;
  charges: number;
  payment_mode: "cash" | "online";
  follow_up_date: string | null;
}

export interface PatientWithVisits extends Patient {
  visits: Visit[];
}

export interface DashboardStats {
  todayPatients: number;
  todayRevenue: number;
  todayCash: number;
  todayOnline: number;
  lowStockItems: number;
  pendingDrafts: number;
  aiBriefing: string;
}

export interface RevenueSummary {
  totalLifetime: number;
  currentMonth: { total: number; cash: number; online: number };
  dailyHistory: { date: string; total: number; cash: number; online: number }[];
  aiSummaries: { daily: string; monthly: string };
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  threshold: number;
  expiry_date: string | null;
  archived: boolean;
  low_stock: boolean;
}

export interface AiVisitDraft {
  problem: string | null;
  diagnosis_or_solution: string | null;
  medicines: string[];
  advice: string | null;
  charges: number | null;
  payment_mode: "cash" | "online" | null;
  follow_up_date: string | null;
}

