# ClinicFlow AI — Full Integration Plan
## Branch: `integrated`
> **Status**: AWAITING APPROVAL  
> **Last Updated**: 2026-11-09  
> **Resume Point**: Start at Phase 1 — Auth Integration

---

## Code Audit Summary (What Each Member Built)

### Member 1 — Frontend (`frontend/`)
| File | Status | Notes |
|---|---|---|
| `app/register/page.tsx` | ❌ Mock | `handleSubmit` has `// TODO: wire up registration API` |
| `app/login/page.tsx` | ❌ Mock | Hardcoded `setTimeout` on login; no real API call |
| `app/otp/page.tsx` | ❌ Mock | Standalone page; duplicates OTP logic from `login/page.tsx` |
| `app/dashboard/page.tsx` | ❌ Mock | Uses `mockDashboardStats` from `mockData.js` |
| `app/patients/page.tsx` | ❌ Mock | Uses `mockPatients` from `mockData.js`; Add Patient button does nothing |
| `app/patients/[id]/page.tsx` | ❌ Mock | Uses `mockPatients` and `mockVisits` from `mockData.js` |
| `app/patients/[id]/add-visit/page.tsx` | ❌ Mock | AI generation is a hardcoded `setTimeout` with fake fields |
| `app/ai-draft/page.tsx` | ❌ Mock | Loads a hardcoded `MOCK_AI_DRAFT` constant; Approve saves nothing |
| `app/revenue/page.tsx` | ❌ Mock | Uses `mockRevenue.aiSummaries` (hardcoded strings) |
| `app/inventory/page.tsx` | ⚠️ Partial | Has local React state; Add Item form works in-memory only |

### Member 2 — Backend (`backend/`)
| File | Status | Notes |
|---|---|---|
| `server.js` | ✅ Ready | Express server on port 5000 with CORS |
| `routes/auth.js` | ✅ Ready | `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-otp` |
| `middleware/auth.js` | ✅ Ready | JWT Bearer token verification |
| `schema.sql` | ✅ Ready | Tables: `clinics`, `patients`, `visits`, `payments`, `inventory_items` |
| `db.js` | ✅ Ready | PostgreSQL pool with `DATABASE_URL` |
| **Missing Routes** | ❌ Not built | No routes for `/patients`, `/visits`, `/inventory`, `/revenue`, `/dashboard` |

### Member 3 — AI (`src/ai/`)
| File | Status | Notes |
|---|---|---|
| `geminiClient.js` | ✅ Ready | Structured JSON output via REST + SDK fallback |
| `prompts.js` | ✅ Ready | Indian OPD shorthand, IST date parsing, payment classification |
| `schemas.js` | ✅ Ready | 7-field strict schema + all business insight schemas |
| `services/visitDraftService.js` | ✅ Ready | Extracts 7 fields; fallback to empty skeleton on error |
| `services/dailySummaryService.js` | ✅ Ready | INR daily briefing with stock alerts |
| `services/monthlySummaryService.js` | ✅ Ready | Monthly revenue analysis |
| `services/inventoryInsightService.js` | ✅ Ready | Low-stock and expiry AI insight |
| `services/reminderDraftService.js` | ✅ Ready | DLT-compliant Indian SMS/WhatsApp draft |
| `src/server.js` | ⚠️ Conflict | AI server also runs on port 5000 → must be moved to port 5001 |

---

## Integration Architecture

```
Browser (Next.js :3000)
       │
       │  API calls via NEXT_PUBLIC_BACKEND_URL
       ▼
Backend Express Server (:5000)
  ├── POST /auth/register, /auth/login, /auth/verify-otp
  ├── GET  /patients, POST /patients
  ├── GET  /patients/:id, GET /patients/:id/visits
  ├── POST /visits                    ← saves to DB
  ├── GET  /dashboard/stats           ← aggregated today's data
  ├── GET  /revenue/summary           ← monthly/daily breakdown
  ├── GET  /inventory, POST /inventory
  └── Internally calls AI Server for summaries
         │
         │  Internal HTTP calls on same server or localhost:5001
         ▼
AI Engine Express Server (:5001)
  ├── POST /api/ai/draft-visit        ← Gemini 7-field extraction
  ├── POST /api/ai/daily-summary      ← Dashboard briefing
  ├── POST /api/ai/monthly-summary    ← Revenue trends
  ├── POST /api/ai/inventory-insights ← Stock analysis
  └── POST /api/ai/draft-reminder     ← SMS/WhatsApp draft
         │
         ▼
   Gemini API (generativelanguage.googleapis.com)
```

---

## Integration Phases

### PHASE 1 — Auth Integration (Frontend <-> Backend)
**Goal**: Replace all mock timeouts in login, OTP, and register with real API calls to Member 2's backend.

#### 1.1 — Create Frontend API Client (`frontend/src/lib/api.ts`)
- Central fetch wrapper that reads `NEXT_PUBLIC_BACKEND_URL`
- Stores JWT token in `localStorage` and auto-injects `Authorization: Bearer <token>` header
- Exposes: `register()`, `login()`, `verifyOtp()`, `get()`, `post()`

#### 1.2 — Wire Register Page (`frontend/app/register/page.tsx`)
- Replace `// TODO: wire up registration API` with real `POST /auth/register`
- On success → redirect to `/login`
- Handle `409 EMAIL_EXISTS` error with inline error message

#### 1.3 — Wire Login Page (`frontend/app/login/page.tsx`)
- Replace `setTimeout` with real `POST /auth/login`
- Store email in `sessionStorage` to pass through to OTP step
- On success → show OTP step (which is already built inline in this page)

#### 1.4 — Wire OTP Verification (inside `login/page.tsx`)
- Replace `setTimeout` verify with real `POST /auth/verify-otp`
- On success → store JWT token in `localStorage`, redirect to `/dashboard`
- Deprecate/remove standalone `app/otp/page.tsx` (duplicate)

#### 1.5 — Auth Guard Middleware (`frontend/src/middleware.ts`)
- Protect `/dashboard`, `/patients`, `/revenue`, `/inventory`, `/ai-draft` routes
- Redirect to `/login` if no JWT token found

---

### PHASE 2 — Backend Route Expansion (Member 2's missing routes)
**Goal**: Build all missing REST routes in `backend/server.js` or separate route files.

#### 2.1 — Patient Routes (`backend/routes/patients.js`)
```
GET  /patients?search=&page=      → list clinic's patients (paginated, searchable)
POST /patients                    → create new patient
GET  /patients/:id                → get patient + all visits
```

#### 2.2 — Visit Routes (`backend/routes/visits.js`)
```
POST /visits                      → create visit + payment record (Member 1's exact JSON contract)
GET  /patients/:id/visits         → list all visits for patient
```
- `medicines` field: stored as `TEXT[]` in Postgres (schema.sql currently uses plain `TEXT` — must fix)

#### 2.3 — Dashboard Route (`backend/routes/dashboard.js`)
```
GET  /dashboard/stats             → { todayPatients, todayRevenue, todayCash, todayOnline, lowStockItems, pendingDrafts, aiBriefing }
```
- Aggregates data from `visits` and `payments` tables filtered to `DATE = today`
- Calls AI `POST /api/ai/daily-summary` and includes `aiBriefing` in response

#### 2.4 — Revenue Routes (`backend/routes/revenue.js`)
```
GET  /revenue/summary             → { currentMonth, dailyHistory[], totalLifetime, aiSummaries }
```
- Calls AI `POST /api/ai/daily-summary` and `POST /api/ai/monthly-summary`

#### 2.5 — Inventory Routes (`backend/routes/inventory.js`)
```
GET  /inventory                   → list all items (with low-stock flag) + AI insight
POST /inventory                   → add item
PATCH /inventory/:id              → update quantity
```
- Calls AI `POST /api/ai/inventory-insights`

---

### PHASE 3 — Frontend Mock Data Replacement
**Goal**: Remove all `mockData.js` imports from every page and replace with real API calls.

#### 3.1 — Dashboard Page
- Replace `mockDashboardStats` with `GET /dashboard/stats`
- Show live patient count, revenue, cash/online split, low-stock count, and live AI briefing

#### 3.2 — Patients Page
- Replace `mockPatients` with `GET /patients?search=`
- Wire "Add New Patient" button to open a modal that calls `POST /patients`
- Wire "Add Visit" button to navigate to `add-visit` page

#### 3.3 — Patient Profile Page
- Replace `mockPatients` and `mockVisits` with `GET /patients/:id`
- Render real visit history timeline

#### 3.4 — Revenue Page
- Replace `mockRevenue` data cards and daily history with `GET /revenue/summary`
- Show live AI summary strings from backend response

#### 3.5 — Inventory Page
- Replace in-memory local state with real `GET /inventory` on load
- Wire "Add Item" modal form to `POST /inventory`
- Persist items to database

---

### PHASE 4 — Live AI Wiring (Frontend <-> AI Engine)
**Goal**: Replace all hardcoded mock AI responses with live Gemini calls.

#### 4.1 — Fix AI Server Port Conflict
- Change `src/server.js` to run on port **5001** (backend already uses 5000)

#### 4.2 — Add Visit Page → Live Gemini Draft
- Replace hardcoded `handleGenerateAI` with real `POST /api/ai/draft-visit`
- Add missing fields to UI: `advice` textarea, `follow_up_date` date picker
- Populate all 7 fields from real Gemini response

#### 4.3 — AI Draft Page → Wire Approve to Backend
- Remove hardcoded `MOCK_AI_DRAFT` constant
- Accept `patientId` via query param (e.g. `/ai-draft?patient=P-1001&visitId=...`)
- On approval: call `POST /visits` with final 7 fields + `patient_id`

#### 4.4 — Dashboard → Live AI Briefing
- Backend embeds AI briefing in `/dashboard/stats` response
- Frontend dashboard shows real Gemini-generated briefing text

#### 4.5 — Revenue → Live AI Summaries
- Backend embeds AI summaries in `/revenue/summary` response
- Frontend revenue page replaces hardcoded strings with live Gemini text

#### 4.6 — Inventory → Live AI Insight
- Backend embeds AI insight in `/inventory` response
- Inventory page shows live Gemini insight card

---

### PHASE 5 — Auth Guard, Error Handling & Polish
**Goal**: Make the integrated app solid for the hackathon demo.

#### 5.1 — JWT Token Lifecycle
- Store JWT in `localStorage` after OTP verify
- Clear `localStorage` on logout (Settings page logout button)
- Auto-redirect to `/login` on `401 UNAUTHORIZED` responses

#### 5.2 — Error Toasts & Loading States
- All API calls show loading spinners while fetching
- All API errors show user-friendly inline error messages
- Empty states for: no patients found, no visits, no inventory items

#### 5.3 — CORS & Environment Hardening
- Backend `.env`: `DATABASE_URL`, `JWT_SECRET`, `AI_SERVER_URL=http://localhost:5001`
- Frontend `.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
- AI `.env`: `GEMINI_API_KEY`, `PORT=5001`

#### 5.4 — `medicines` Schema Fix
- Change `medicines TEXT` to `medicines TEXT[]` in `visits` table
- Backend `POST /visits`: Accept `medicines` as array and store as `TEXT[]`
- Backend `GET /patients/:id`: Return `medicines` as array back to frontend

---

## File Change Summary

### New Files to Create
| File | Purpose |
|---|---|
| `frontend/src/lib/api.ts` | Central API client with JWT header injection |
| `frontend/src/middleware.ts` | Auth guard for protected routes |
| `frontend/src/lib/auth.ts` | Token helpers: getToken, setToken, clearToken |
| `backend/routes/patients.js` | Patient CRUD routes |
| `backend/routes/visits.js` | Visit creation + listing routes |
| `backend/routes/dashboard.js` | Dashboard stats aggregation route |
| `backend/routes/revenue.js` | Revenue summary route |
| `backend/routes/inventory.js` | Inventory CRUD routes |

### Files to Modify
| File | Change |
|---|---|
| `frontend/app/register/page.tsx` | Wire handleSubmit to `POST /auth/register` |
| `frontend/app/login/page.tsx` | Wire login + OTP to real backend; store JWT |
| `frontend/app/dashboard/page.tsx` | Replace mockDashboardStats with `GET /dashboard/stats` |
| `frontend/app/patients/page.tsx` | Replace mock with `GET /patients`; wire Add Patient |
| `frontend/app/patients/[id]/page.tsx` | Replace mock with `GET /patients/:id` |
| `frontend/app/patients/[id]/add-visit/page.tsx` | Wire AI Draft to live Gemini; Save to `POST /visits` |
| `frontend/app/ai-draft/page.tsx` | Remove MOCK_AI_DRAFT; wire Approve to `POST /visits` |
| `frontend/app/revenue/page.tsx` | Replace mockRevenue with `GET /revenue/summary` |
| `frontend/app/inventory/page.tsx` | Replace local state with `GET/POST /inventory` |
| `backend/server.js` | Register all new route files |
| `backend/schema.sql` | Fix medicines TEXT to TEXT[] |
| `src/server.js` (AI) | Change port from 5000 to 5001 |

### Files to Remove
| File | Reason |
|---|---|
| `frontend/app/otp/page.tsx` | Duplicate; OTP is handled inside login/page.tsx |
| `frontend/src/mocks/mockData.js` | No longer needed after wiring |

---

## Environment Files Needed

### `frontend/.env.local` (create this)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### `backend/.env` (already in .gitignore)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/clinicflow
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
AI_SERVER_URL=http://localhost:5001
```

### `src/.env` or `.env` root (AI server, already in .gitignore)
```
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

---

## How to Resume This Plan

If the model changes or conversation restarts, tell the AI:
> "Read INTEGRATION_PLAN.md in my FlexMD folder and continue from the last unchecked phase."

## Progress Tracker
- [x] Phase 1 — Auth Integration (Frontend <-> Backend) ✅ DONE
- [x] Phase 2 — Backend Route Expansion ✅ DONE
- [x] Phase 3 — Frontend Mock Data Replacement ✅ DONE
- [x] Phase 4 — Live AI Wiring ✅ DONE
- [x] Phase 5 — Error Handling, Auth Guard & Polish ✅ DONE
- [ ] Final — Commit and push to `integrated` branch on GitHub (RUN MANUALLY)

