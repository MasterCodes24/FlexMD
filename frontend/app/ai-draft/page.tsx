"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Shield,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

// ─── Mock AI-generated draft (simulating Gemini JSON output) ───────────────────
const MOCK_AI_DRAFT = {
  patientName: "Rahul Sharma",
  patientId: "P-1001",
  visitDate: "2026-11-07",
  complaint: "Severe headache on the right side, nausea since 2 days. Sensitivity to light.",
  diagnosis: "Migraine without aura",
  medicines: [
    { name: "Naproxen 500mg", dose: "1 tablet SOS, max twice a day" },
    { name: "Pantoprazole 40mg", dose: "1 tablet before breakfast for 5 days" },
    { name: "Domperidone 10mg", dose: "1 tablet before meals for 3 days" },
  ],
  advice: "Rest in a dark, quiet room. Avoid screens. Stay hydrated. Follow up if symptoms worsen.",
  followUpDate: "2026-11-14",
  charges: 400,
  paymentMode: "online",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <SectionLabel label={label} />
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AiDraftPage() {
  const router = useRouter();

  // Editable fields
  const [complaint, setComplaint] = useState(MOCK_AI_DRAFT.complaint);
  const [diagnosis, setDiagnosis] = useState(MOCK_AI_DRAFT.diagnosis);
  const [advice, setAdvice] = useState(MOCK_AI_DRAFT.advice);
  const [followUpDate, setFollowUpDate] = useState(MOCK_AI_DRAFT.followUpDate);
  const [medicines, setMedicines] = useState(MOCK_AI_DRAFT.medicines);
  const [charges, setCharges] = useState(String(MOCK_AI_DRAFT.charges));
  const [paymentMode, setPaymentMode] = useState(MOCK_AI_DRAFT.paymentMode);

  // UI state
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleMedChange = (index: number, field: "name" | "dose", value: string) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMed = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMed = () => {
    setMedicines((prev) => [...prev, { name: "", dose: "" }]);
  };

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      setApproved(true);
      setTimeout(() => router.push("/patients/P-1001"), 1200);
    }, 1800);
  };

  const handleDiscard = () => {
    if (confirm("Discard this AI draft? The visit will not be saved.")) {
      router.push("/patients/P-1001");
    }
  };

  if (approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Visit Record Approved</h2>
          <p className="text-sm text-gray-500">Redirecting to patient profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Draft Review</h1>
            <p className="text-xs text-gray-500">
              {MOCK_AI_DRAFT.patientName} · {MOCK_AI_DRAFT.visitDate}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
          <Sparkles className="w-3 h-3" />
          Gemini Draft
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Safety Disclaimer Banner (collapsible) ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setDisclaimerOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-sm font-semibold text-amber-900">
                Important Safety Notice — Read Before Approving
              </span>
            </div>
            {disclaimerOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {disclaimerOpen && (
            <div className="px-4 pb-4 space-y-2 text-sm text-amber-800 border-t border-amber-100">
              <ul className="list-disc ml-5 space-y-1 mt-2">
                <li>
                  This draft was <strong>auto-generated by Gemini AI</strong> and may contain
                  errors, omissions, or hallucinations.
                </li>
                <li>
                  <strong>You, the licensed doctor, are solely responsible</strong> for verifying
                  the clinical accuracy of all diagnoses, medicines, and dosages before approving.
                </li>
                <li>
                  Approving this draft constitutes your <strong>explicit medical sign-off</strong>{" "}
                  under DPDP Act 2023 fiduciary guidelines.
                </li>
                <li>
                  <strong>Do not approve</strong> if you have not independently reviewed the
                  patient and confirmed the information below.
                </li>
              </ul>
              <div className="flex items-center gap-1.5 mt-3 text-amber-700">
                <Shield className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">
                  Doctor-Controlled AI · DPDP Act 2023 Compliant
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Editable Draft Form ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">
            Visit Details — Edit as needed
          </h2>

          {/* Complaint */}
          <FieldInput
            label="Chief Complaint"
            value={complaint}
            onChange={setComplaint}
            textarea
          />

          {/* Diagnosis */}
          <FieldInput label="Diagnosis" value={diagnosis} onChange={setDiagnosis} />

          {/* Medicines */}
          <div>
            <SectionLabel label="Prescribed Medicines" />
            <div className="space-y-2">
              {medicines.map((med, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleMedChange(i, "name", e.target.value)}
                    placeholder="Medicine name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={med.dose}
                    onChange={(e) => handleMedChange(i, "dose", e.target.value)}
                    placeholder="Dosage instructions"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveMed(i)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddMed}
              className="mt-2 text-sm text-blue-600 font-medium hover:underline"
            >
              + Add medicine
            </button>
          </div>

          {/* Advice */}
          <FieldInput label="Doctor's Advice" value={advice} onChange={setAdvice} textarea />

          {/* Follow-up & Payment row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <SectionLabel label="Follow-up Date" />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <SectionLabel label="Charges (₹)" />
              <input
                type="number"
                min={0}
                value={charges}
                onChange={(e) => setCharges(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <SectionLabel label="Payment Mode" />
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="cash">Cash</option>
                <option value="online">Online (UPI)</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Discard */}
          <button
            onClick={handleDiscard}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Discard Draft
          </button>

          {/* Approve */}
          <button
            onClick={handleApprove}
            disabled={approving}
            className="flex-2 flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm sm:flex-1"
          >
            {approving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve & Save Visit
              </>
            )}
          </button>
        </div>

        {/* ── Compliance footer ── */}
        <p className="text-center text-xs text-gray-400">
          <Shield className="w-3 h-3 inline mr-1" />
          Doctor-Controlled AI · DPDP Act 2023 · Your approval is the final authority
        </p>
      </div>
    </div>
  );
}
