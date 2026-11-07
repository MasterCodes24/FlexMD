"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check, X, IndianRupee } from 'lucide-react';
import { mockPatients } from '../../../../src/mocks/mockData';

export default function AddVisitAndAIDraft() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const patient = mockPatients.find(p => p.id === patientId);

  // Form States
  const [transcript, setTranscript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  // Editable Draft States
  const [problem, setProblem] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [charges, setCharges] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  if (!patient) return null;

  // Simulate AI Generation delay for the demo
  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Hardcoded AI result for demo purposes
      setProblem("High fever and body ache for 2 days.");
      setDiagnosis("Viral Pyrexia");
      setMedicines("1. Paracetamol 650mg (TID)\n2. Cetirizine 10mg (HS)");
      setCharges("400");
      setPaymentMode("online");
      
      setIsGenerating(false);
      setShowDraft(true);
    }, 1500);
  };

  const handleSave = () => {
    alert("Visit saved! Revenue and inventory updated.");
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Visit: {patient.name}</h1>
          <p className="text-sm text-gray-500">Record consultation and capture revenue.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Input */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Consultation Notes / Audio</h2>
          <p className="text-sm text-gray-500">Type your rough notes here, or paste a voice transcript. Gemini AI will structure it automatically.</p>
          
          <textarea 
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="e.g., Patient came with high fever and body ache for 2 days. Looks like viral pyrexia. Prescribing Paracetamol 650mg three times a day and Cetirizine 10mg at night. Charged 400 rupees via UPI."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          ></textarea>

          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating || transcript.length < 5}
            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGenerating ? "Gemini is analyzing..." : "Generate AI Draft"}
          </button>
        </div>

        {/* RIGHT COLUMN: AI Draft Review */}
        <div className={`bg-white shadow-sm rounded-lg border p-6 space-y-4 transition-all ${showDraft ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-gray-200 opacity-50 pointer-events-none'}`}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              AI Draft 
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Doctor Review Required
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chief Complaint</label>
              <input type="text" value={problem} onChange={e => setProblem(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis</label>
              <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Medicines</label>
              <textarea rows={3} value={medicines} onChange={e => setMedicines(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Charges (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee className="h-4 w-4 text-gray-400" /></div>
                  <input type="number" value={charges} onChange={e => setCharges(e.target.value)} className="w-full pl-9 p-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                  <option value="cash">Cash</option>
                  <option value="online">Online / UPI</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex space-x-3">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" /> Approve & Save
            </button>
            <button onClick={() => setShowDraft(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}