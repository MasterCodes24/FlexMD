"use client";

import { useEffect, useState } from "react";
import { Users, IndianRupee, Wallet, CreditCard, AlertTriangle, FileText, Plus, Sparkles, Loader2 } from "lucide-react";
import { dashboardApi, patientsApi, type DashboardStats, type Patient } from "../../src/lib/api";
import Link from "next/link";
import AddPatientModal from "../../src/components/AddPatientModal";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handlePatientAdded = (_p: Patient) => {
    setShowAddPatient(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddPatient(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </button>
          <Link href="/patients">
            <button className="flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Visit
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Daily Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients Today" value={stats?.todayPatients ?? 0} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Total Revenue" value={`₹${(stats?.todayRevenue ?? 0).toLocaleString("en-IN")}`} icon={IndianRupee} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Cash Collected" value={`₹${(stats?.todayCash ?? 0).toLocaleString("en-IN")}`} icon={Wallet} colorClass="bg-yellow-100 text-yellow-600" />
        <StatCard title="Online Collected" value={`₹${(stats?.todayOnline ?? 0).toLocaleString("en-IN")}`} icon={CreditCard} colorClass="bg-purple-100 text-purple-600" />
      </div>

      {/* AI Briefing + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Daily Briefing */}
        {stats?.aiBriefing && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center mb-3">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">AI Daily Briefing</h3>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed font-medium">&quot;{stats.aiBriefing}&quot;</p>
          </div>
        )}

        {/* Inventory Alert */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-900">{stats?.lowStockItems ?? 0}</span> items are running low on stock.
            </p>
            <Link href="/inventory" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
              View Inventory →
            </Link>
          </div>
        </div>

        {/* Pending AI Drafts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add a Visit</h3>
            <p className="text-sm text-gray-500 mt-1">Use Gemini AI to draft consultation notes instantly.</p>
            <Link href="/patients" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
              Go to Patients →
            </Link>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onAdded={handlePatientAdded}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, colorClass }: { title: string; value: string | number; icon: React.ElementType; colorClass: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
