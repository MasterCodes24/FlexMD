"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Check, X, IndianRupee, Loader2, Plus, Trash2,
  Package, AlertTriangle, AlertCircle, CheckCircle2
} from "lucide-react";
import {
  patientsApi, visitsApi, aiApi, inventoryApi,
  type Patient, type AiVisitDraft, type InventoryItem
} from "../../../../src/lib/api";

interface PrescribedMed {
  name: string;
  quantity: number;
  dose: string;
}

function parseRawMedString(raw: string): PrescribedMed {
  if (!raw) return { name: "", quantity: 1, dose: "" };

  let name = raw;
  let quantity = 1;
  let dose = "";

  const qtyMatch =
    raw.match(/\(qty[:\s]*(\d+)\)/i) ||
    raw.match(/(\d+)\s*(?:strip|strips|bottle|bottles|pack|packs|sachet|sachets|unit|units|box|boxes)\b/i);

  if (qtyMatch) {
    quantity = Math.max(1, parseInt(qtyMatch[1], 10));
  }

  const dashParts = raw.split(/[-–]/);
  if (dashParts.length > 1) {
    name = dashParts[0].replace(/\(qty[:\s]*\d+\)/i, "").trim();
    dose = dashParts.slice(1).join("-").trim();
  } else {
    name = raw.replace(/\(qty[:\s]*\d+\)/i, "").trim();
  }

  return { name, quantity, dose };
}

function formatMedForSave(med: PrescribedMed): string {
  const name = med.name.trim();
  if (!name) return "";
  const qStr = `(Qty: ${med.quantity > 0 ? med.quantity : 1})`;
  if (med.dose.trim()) {
    return `${name} ${qStr} - ${med.dose.trim()}`;
  }
  return `${name} ${qStr}`;
}

export default function AddVisitPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Input
  const [transcript, setTranscript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // 7-field AI Draft
  const [showDraft, setShowDraft] = useState(false);
  const [problem, setProblem] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState<PrescribedMed[]>([{ name: "", quantity: 1, dose: "" }]);
  const [advice, setAdvice] = useState("");
  const [charges, setCharges] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");
  const [followUpDate, setFollowUpDate] = useState("");

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    patientsApi
      .get(patientId)
      .then((data) => setPatient(data))
      .catch(() => router.push("/patients"));

    // Fetch clinic inventory to show stock counts & autocomplete
    inventoryApi
      .listRaw()
      .then((res: { ok: boolean; data: InventoryItem[] }) => {
        if (res?.data) setInventory(res.data);
      })
      .catch(() => {});
  }, [patientId, router]);

  const populateDraft = (draft: AiVisitDraft) => {
    setProblem(draft.problem ?? "");
    setDiagnosis(draft.diagnosis_or_solution ?? "");

    if (draft.medicines?.length) {
      setMedicines(draft.medicines.map((m) => parseRawMedString(m)));
    } else {
      setMedicines([{ name: "", quantity: 1, dose: "" }]);
    }

    setAdvice(draft.advice ?? "");
    setCharges(draft.charges != null ? String(draft.charges) : "");
    setPaymentMode(draft.payment_mode ?? "cash");
    setFollowUpDate(draft.follow_up_date ?? "");
    setShowDraft(true);
  };

  const handleGenerateAI = async () => {
    if (transcript.trim().length < 5) return;
    setIsGenerating(true);
    setAiError("");
    try {
      const draft = await aiApi.draftVisit(transcript.trim());
      populateDraft(draft);
    } catch (e: unknown) {
      setAiError("AI extraction failed. You can fill in the fields manually below.");
      setShowDraft(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMedChange = (idx: number, field: keyof PrescribedMed, value: string | number) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMed = () => setMedicines((prev) => [...prev, { name: "", quantity: 1, dose: "" }]);
  const handleRemoveMed = (idx: number) => setMedicines((prev) => prev.filter((_, i) => i !== idx));

  // Find matching inventory item for a prescribed medicine
  const getMatchingInventoryItem = (medName: string) => {
    if (!medName || !medName.trim()) return null;
    const clean = medName.toLowerCase().trim();
    return inventory.find((inv) => {
      const iName = inv.name.toLowerCase().trim();
      return clean.includes(iName) || iName.includes(clean);
    });
  };

  const handleSave = async () => {
    if (!charges || !paymentMode) {
      setSaveError("Charges and payment mode are required.");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      const formattedMeds = medicines
        .map((m) => formatMedForSave(m))
        .filter((m) => m.length > 0);

      await visitsApi.create({
        patient_id: Number(patientId),
        problem: problem.trim() || "",
        diagnosis_or_solution: diagnosis.trim() || "",
        medicines: formattedMeds,
        advice: advice.trim() || undefined,
        charges: Number(charges),
        payment_mode: paymentMode,
        follow_up_date: followUpDate || null,
      });

      router.push(`/patients/${patientId}`);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save visit. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!patient)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Autocomplete Datalist for clinic inventory */}
      <datalist id="clinic-inventory-list">
        {inventory.map((inv) => (
          <option key={inv.id} value={inv.name}>
            {inv.name} ({inv.quantity} {inv.unit} in stock)
          </option>
        ))}
      </datalist>

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Consultation: {patient.name}</h1>
          <p className="text-sm text-gray-500">Record visit notes and dispense medicine from clinic inventory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Transcript Input */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Consultation Notes / Voice Transcript</h2>
          <p className="text-sm text-gray-500">
            Type rough notes or paste consultation transcript. Gemini AI will extract all 7 fields automatically.
          </p>
          <textarea
            rows={9}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm resize-none text-gray-900 bg-white"
            placeholder={`e.g. Patient came with fever and body ache for 2 days. Viral pyrexia. Giving 2 strips of Paracetamol 650mg TDS and 1 strip of Cetirizine 10mg HS. Charged 300 rupees cash.`}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />

          {aiError && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg">{aiError}</p>
          )}

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || transcript.trim().length < 5}
            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors shadow-sm"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGenerating ? "Gemini is analyzing..." : "Generate AI Draft"}
          </button>

          <button
            onClick={() => {
              setShowDraft(true);
              setMedicines([{ name: "", quantity: 1, dose: "" }]);
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline text-center block"
          >
            Skip AI — enter consultation manually
          </button>
        </div>

        {/* RIGHT: 7-Field AI Draft & Inventory Deduction */}
        <div
          className={`bg-white shadow-sm rounded-lg border p-6 space-y-4 transition-all ${
            showDraft ? "border-indigo-300 ring-1 ring-indigo-100" : "border-gray-200 opacity-40 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {showDraft && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  AI Draft — Doctor Review Required
                </span>
              )}
              {!showDraft && "Consultation Form"}
            </h2>
          </div>

          <div className="space-y-3.5">
            {/* Problem */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chief Complaint / Problem</label>
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
                placeholder="e.g. Fever and body ache for 2 days"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis / Solution</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm font-semibold text-blue-700 bg-blue-50"
                placeholder="e.g. Viral Pyrexia"
              />
            </div>

            {/* Prescribed Medicines with Exact Dispensed Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-800">
                  Medicines & Clinic Dispensing (Auto-deducted on Save)
                </label>
                <span className="text-[11px] text-gray-500">Pick from stock to auto-deduct</span>
              </div>

              <div className="space-y-2.5">
                {medicines.map((med, i) => {
                  const matched = getMatchingInventoryItem(med.name);

                  return (
                    <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex gap-2 items-center">
                        {/* Medicine name with datalist */}
                        <div className="flex-1">
                          <input
                            type="text"
                            list="clinic-inventory-list"
                            value={med.name}
                            onChange={(e) => handleMedChange(i, "name", e.target.value)}
                            placeholder="Type or pick medicine..."
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 font-medium"
                          />
                        </div>

                        {/* Amount / Qty to dispense */}
                        <div className="w-24">
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={med.quantity}
                            onChange={(e) =>
                              handleMedChange(i, "quantity", Math.max(1, parseInt(e.target.value, 10) || 1))
                            }
                            title="Amount given to patient (will be reduced from inventory)"
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 text-center font-bold"
                          />
                          <span className="text-[10px] text-gray-500 block text-center font-medium">Qty Given</span>
                        </div>

                        {/* Delete button */}
                        {medicines.length > 1 && (
                          <button
                            onClick={() => handleRemoveMed(i)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dosage instructions */}
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) => handleMedChange(i, "dose", e.target.value)}
                        placeholder="Dosage instruction (e.g. 1 tablet TDS after meals x 3 days)"
                        className="w-full p-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-900"
                      />

                      {/* Live stock count badge */}
                      {matched && (
                        <div className="flex items-center gap-1.5 text-xs pt-0.5">
                          {Number(matched.quantity) === 0 ? (
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Out of stock in clinic (0 {matched.unit} left)
                            </span>
                          ) : Number(matched.quantity) <= Number(matched.threshold) ? (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock: only {matched.quantity} {matched.unit} left!
                            </span>
                          ) : (
                            <span className="text-green-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock: {matched.quantity} {matched.unit} available
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
                className="mt-2 text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Add another medicine
              </button>
            </div>

            {/* Advice */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Doctor&apos;s Advice</label>
              <textarea
                rows={2}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none text-gray-900 bg-white"
                placeholder="e.g. Drink warm water, rest, avoid oily food"
              />
            </div>

            {/* Charges, Payment, Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Charges (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                    min={0}
                    className="w-full pl-7 p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white font-semibold"
                    placeholder="300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as "cash" | "online")}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online / UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {saveError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">{saveError}</p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-gray-100 flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving Visit & Deducting Stock...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approve & Save Visit
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowDraft(false);
                setTranscript("");
              }}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
