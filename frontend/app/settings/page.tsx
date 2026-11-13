"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Shield, Bell, BrainCircuit } from "lucide-react";
import { clearToken } from "../../src/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    clearToken();
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Clinic Account */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="px-6 py-4 flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Clinic Account</h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">Shared clinic login — all doctors use the same credentials and OTP.</p>
        </div>
        <div className="px-6 py-4">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="px-6 py-4 flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">AI Settings</h2>
        </div>
        <div className="px-6 py-4 space-y-1">
          <p className="text-sm font-medium text-gray-800">Gemini AI Drafts</p>
          <p className="text-xs text-gray-500">AI drafts consultation notes from your typed notes or transcripts. The doctor always reviews and approves before saving.</p>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            DPDP Act 2023 compliant · AI assists; doctor decides.
          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="px-6 py-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Reminders & Follow-ups</h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">
            Follow-up reminders are optional. Enable them in a future update to send SMS or WhatsApp reminders to patients with phone numbers.
          </p>
          <span className="mt-2 inline-block text-xs text-gray-400">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
