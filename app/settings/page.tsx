"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  Hash,
  Shield,
  Bell,
  Calendar,
  Mic,
  ChevronRight,
  Lock,
} from "lucide-react";

// ─── Reusable Toggle Row ───────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, title, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Right side — custom toggle switch */}
      <button
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  return (
    <div className="space-y-6">
      {/* ── Section 1: Page Header ── */}
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* ── Section 2: Clinic Profile (Read-Only) ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Card header */}
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Clinic Profile</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-1">
            Read-Only
          </span>
        </div>

        {/* 2-column grid of fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* Clinic Name */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Clinic Name
            </p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              Dr. Smith&apos;s Multispecialty Clinic
            </p>
          </div>

          {/* License Number */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              License Number
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm font-medium text-gray-900">MH-MCI-2019-04821</p>
              <Lock className="w-3.5 h-3.5 text-green-500" />
            </div>
          </div>

          {/* Registered Email */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Registered Email
            </p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              drsmith@clinicflow.ai
            </p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              +91 98765 43210
            </p>
          </div>

          {/* Address — full width */}
          <div className="md:col-span-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Address
            </p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              12, Wellness Complex, Andheri West, Mumbai - 400058
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Module Toggles ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Card header */}
        <div className="mb-1">
          <h2 className="text-base font-semibold text-gray-900">Platform Modules</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage which features are active for your clinic
          </p>
        </div>

        {/* Toggle rows with dividers */}
        <div className="divide-y divide-gray-100">
          {/* WhatsApp Reminders */}
          <ToggleRow
            icon={
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
            }
            title="WhatsApp Reminders"
            description="Send automated appointment reminders to patients via WhatsApp"
            enabled={whatsappEnabled}
            onToggle={() => setWhatsappEnabled((v) => !v)}
          />

          {/* Appointment Booking */}
          <ToggleRow
            icon={
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
            }
            title="Appointment Booking"
            description="Allow patients to book slots online via a shareable link"
            enabled={bookingEnabled}
            onToggle={() => setBookingEnabled((v) => !v)}
          />

          {/* Ambient Voice Recording */}
          <ToggleRow
            icon={
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                <Mic className="w-5 h-5 text-blue-500" />
              </div>
            }
            title="Ambient Voice Recording"
            description="Automatically transcribe doctor-patient conversations in real-time"
            enabled={voiceEnabled}
            onToggle={() => setVoiceEnabled((v) => !v)}
          />
        </div>
      </div>

      {/* ── Section 4: Compliance Footer ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-900">DPDP Act 2023 Compliant</p>
          <p className="text-sm text-blue-700 mt-0.5">
            All patient data is stored with Doctor-Controlled AI access. No data is
            shared without explicit consent.
          </p>
        </div>
      </div>
    </div>
  );
}
