"use client";

import { IndianRupee, TrendingUp, Wallet, CreditCard, Sparkles, Calendar } from 'lucide-react';
import { mockRevenue } from '../../src/mocks/mockData';

export default function RevenueDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
        <button className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          November 2026
        </button>
      </div>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm">
          <div className="flex items-center mb-3">
            <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Daily AI Summary</h3>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            "{mockRevenue.aiSummaries.daily}"
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100 shadow-sm">
          <div className="flex items-center mb-3">
            <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Monthly AI Insight</h3>
          </div>
          <p className="text-sm text-purple-800 leading-relaxed font-medium">
            "{mockRevenue.aiSummaries.monthly}"
          </p>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1.5"/> This Month
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{mockRevenue.currentMonth.total.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center">
            <Wallet className="w-4 h-4 mr-1.5"/> Cash (Month)
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ₹{mockRevenue.currentMonth.cash.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center">
            <CreditCard className="w-4 h-4 mr-1.5"/> Online (Month)
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ₹{mockRevenue.currentMonth.online.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 flex items-center">
            <IndianRupee className="w-4 h-4 mr-1.5"/> Lifetime Revenue
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{mockRevenue.totalLifetime.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Daily History Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
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
              {mockRevenue.dailyHistory.map((day, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    ₹{day.total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 mr-2 text-green-500" /> 
                      ₹{day.cash.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-blue-500" /> 
                      ₹{day.online.toLocaleString('en-IN')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}