"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles, AlertTriangle, CheckCircle, Trash2, Shield,
  ChevronDown, ChevronUp, Loader2, Plus, AlertCircle, CheckCircle2
} from "lucide-react";
import { visitsApi, inventoryApi, type InventoryItem } from "../../src/lib/api";

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>;
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
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        />
      )}
    </div>
  );
}

interface PrescribedMed {
  name: string;
  quantity: number;
  dose: string;
}

function AiDraftPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient");
  const patientName = searchParams.get("name") ?? "Patient";

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // 7 editable fields
  const [complaint, setComplaint] = useState(searchParams.get("problem") ?? "");
  const [diagnosis, setDiagnosis] = useState(searchParams.get("diagnosis") ?? "");
  const [advice, setAdvice] = useState(searchParams.get("advice") ?? "");
  const [followUpDate, setFollowUpDate] = useState(searchParams.get("follow_up_date") ?? "");
  const [medicines, setMedicines] = useState<PrescribedMed[]>(() => {
    const medsParam = searchParams.get("medicines");
    if (medsParam) {
      try {
        return JSON.parse(medsParam).map((m: string) => {
          const qtyMatch = m.match(/\(qty[:\s]*(\d+)\)/i);
          const quantity = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 1;
          const clean = m.replace(/\(qty[:\s]*\d+\)/i, "").trim();
          const spaceIdx = clean.indexOf(" - ");
          return spaceIdx > -1
            ? { name: clean.slice(0, spaceIdx).trim(), quantity, dose: clean.slice(spaceIdx + 3).trim() }
            : { name: clean, quantity, dose: "" };
        });
      } catch {
        /* fall through */
      }
    }
    return [{ name: "", quantity: 1, dose: "" }];
  });
  const [charges, setCharges] = useState(searchParams.get("charges") ?? "");
  const [paymentMode, setPaymentMode] = useState(searchParams.get("payment_mode") ?? "cash");

  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    inventoryApi
      .listRaw()
      .then((res: { ok: boolean; data: InventoryItem[] }) => {
        if (res?.data) setInventory(res.data);
      })
      .catch(() => {});
  }, []);

  const handleMedChange = (index: number, field: keyof PrescribedMed, value: string | number) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };
  const handleRemoveMed = (index: number) => setMedicines((prev) => prev.filter((_, i) => i !== index));
  const handleAddMed = () => setMedicines((prev) => [...prev, { name: "", quantity: 1, dose: "" }]);

  const getMatchingInventoryItem = (medName: string) => {
    if (!medName || !medName.trim()) return null;
    const clean = medName.toLowerCase().trim();
    return inventory.find((inv) => {
      const iName = inv.name.toLowerCase().trim();
      return clean.includes(iName) || iName.includes(clean);
    });
  };

  const handleApprove = async () => {
    if (!patientId || !charges || !paymentMode) {
      setSaveError("Missing patient ID, charges or payment mode. Go back and use Add Visit flow.");
      return;
    }
    setApproving(true);
    setSaveError("");
    try {
      const formattedMeds = medicines
        .map((m) => {
          const name = m.name.trim();
          if (!name) return "";
          const qStr = `(Qty: ${m.quantity > 0 ? m.quantity : 1})`;
          return m.dose.trim() ? `${name} ${qStr} - ${m.dose.trim()}` : `${name} ${qStr}`;
        })
        .filter(Boolean);

      await visitsApi.create({
        patient_id: Number(patientId),
        problem: complaint,
        diagnosis_or_solution: diagnosis,
        medicines: formattedMeds,
        advice,
        charges: Number(charges),
        payment_mode: paymentMode as "cash" | "online",
        follow_up_date: followUpDate || null,
      });

      setApproving(false);
      setApproved(true);
      setTimeout(() => router.push(`/patients/${patientId}`), 1200);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save. Please try again.");
      setApproving(false);
    }
  };

  const handleDiscard = () => {
    if (confirm("Discard this AI draft? The visit will not be saved.")) {
      router.back();
    }
  };

  if (approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Visit Record Approved & Inventory Deducted</h2>
          <p className="text-sm text-gray-500">Redirecting to patient profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <datalist id="clinic-inventory-list-draft">
        {inventory.map((inv) => (
          <option key={inv.id} value={inv.name}>
            {inv.name} ({inv.quantity} {inv.unit} in stock)
          </option>
        ))}
      </datalist>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Review AI Draft & Dispense</h1>
            <p className="text-xs text-gray-500">{patientName}</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <AlertTriangle className="w-3 h-3" /> Doctor Review Required
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setDisclaimerOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-amber-900"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> AI Draft Disclaimer
            </span>
            {disclaimerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {disclaimerOpen && (
            <div className="px-4 pb-4 text-xs text-amber-800 leading-relaxed">
              This is an <strong>AI-generated draft</strong>. It extracts only information explicitly stated in the
              consultation notes. Review the dispensed medicines and quantities below before approving.{" "}
              <strong>Stock is deducted from inventory only when you approve and save.</strong>
            </div>
          )}
        </div>

        {/* 7 Editable Fields */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <FieldInput label="Chief Complaint / Problem" value={complaint} onChange={setComplaint} textarea />
          <FieldInput label="Diagnosis / Solution" value={diagnosis} onChange={setDiagnosis} />

          {/* Medicines with Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <SectionLabel label="Prescribed Medicines & Dispensed Amount" />
              <span className="text-[11px] text-gray-400">Auto-deducted on approval</span>
            </div>

            <div className="space-y-2.5">
              {medicines.map((med, i) => {
                const matched = getMatchingInventoryItem(med.name);

                return (
                  <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        list="clinic-inventory-list-draft"
                        value={med.name}
                        onChange={(e) => handleMedChange(i, "name", e.target.value)}
                        placeholder="Medicine name"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-medium"
                      />
                      <div className="w-24">
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={med.quantity}
                          onChange={(e) =>
                            handleMedChange(i, "quantity", Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          title="Quantity given from clinic inventory"
                          className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-center font-bold"
                        />
                        <span className="text-[10px] text-gray-500 block text-center font-medium">Qty Given</span>
                      </div>
                      {medicines.length > 1 && (
                        <button
                          onClick={() => handleRemoveMed(i)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={med.dose}
                      onChange={(e) => handleMedChange(i, "dose", e.target.value)}
                      placeholder="Dosage instructions (e.g. 1 tab after breakfast x 5 days)"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />

                    {matched && (
                      <div className="flex items-center gap-1.5 text-xs pt-0.5">
                        {Number(matched.quantity) === 0 ? (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Out of stock (0 {matched.unit} in clinic)
                          </span>
                        ) : Number(matched.quantity) <= Number(matched.threshold) ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low stock: only {matched.quantity} {matched.unit} left!
                          </span>
                        ) : (
                          <span className="text-green-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> In stock: {matched.quantity} {matched.unit} available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAddMed}
              className="mt-2 text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> + Add medicine
            </button>
          </div>

          <FieldInput label="Doctor's Advice" value={advice} onChange={setAdvice} textarea />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <SectionLabel label="Follow-up Date" />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <SectionLabel label="Charges (₹)" />
              <input
                type="number"
                min={0}
                value={charges}
                onChange={(e) => setCharges(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white font-semibold"
              />
            </div>
            <div>
              <SectionLabel label="Payment Mode" />
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="cash">Cash</option>
                <option value="online">Online (UPI)</option>
              </select>
            </div>
          </div>
        </div>

        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{saveError}</p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDiscard}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Discard Draft
          </button>
          <button
            onClick={handleApprove}
            disabled={approving}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            {approving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving & Deducting Stock…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve &amp; Save Visit
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Shield className="w-3 h-3 inline mr-1" />
          Doctor-Controlled AI · DPDP Act 2023 · Your approval is the final authority
        </p>
      </div>
    </div>
  );
}

export default function AiDraftPage() {
  return (
    <Suspense>
      <AiDraftPageInner />
    </Suspense>
  );
}
