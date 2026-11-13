"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee, TrendingUp, Wallet, CreditCard, Sparkles, Calendar, Loader2
} from "lucide-react";
import { revenueApi, type RevenueSummary } from "../../src/lib/api";

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    revenueApi.summary()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  const currentMonth = data?.currentMonth ?? { total: 0, cash: 0, online: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {/* AI Summaries */}
      {data?.aiSummaries && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center mb-3">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Daily AI Summary</h3>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed font-medium">&quot;{data.aiSummaries.daily}&quot;</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center mb-3">
              <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Monthly AI Insight</h3>
            </div>
            <p className="text-sm text-purple-800 leading-relaxed font-medium">&quot;{data.aiSummaries.monthly}&quot;</p>
          </div>
        </div>
      )}

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center"><TrendingUp className="w-4 h-4 mr-1.5" /> This Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{currentMonth.total.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center"><Wallet className="w-4 h-4 mr-1.5" /> Cash (Month)</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹{currentMonth.cash.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center"><CreditCard className="w-4 h-4 mr-1.5" /> Online (Month)</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">₹{currentMonth.online.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center"><IndianRupee className="w-4 h-4 mr-1.5" /> Lifetime Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{(data?.totalLifetime ?? 0).toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Daily History Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900">Recent Daily Collections</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Collected</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Online / UPI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.dailyHistory && data.dailyHistory.length > 0 ? (
                data.dailyHistory.map((day, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{Number(day.total).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-sm text-green-700 font-medium">₹{Number(day.cash).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-sm text-blue-700 font-medium">₹{Number(day.online).toLocaleString("en-IN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    No revenue data yet. Start recording visits to see collections here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
