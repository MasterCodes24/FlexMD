import { Users, IndianRupee, Wallet, CreditCard, AlertTriangle, FileText, Plus } from 'lucide-react';
import { mockDashboardStats } from '../../src/mocks/mockData';
import Link from 'next/link';


export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Visit
          </button>
        </div>
      </div>

      {/* Daily Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Patients Today" 
          value={mockDashboardStats.todayPatients} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${mockDashboardStats.todayRevenue.toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          colorClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Cash Collected" 
          value={`₹${mockDashboardStats.todayCash.toLocaleString('en-IN')}`} 
          icon={Wallet} 
          colorClass="bg-yellow-100 text-yellow-600" 
        />
        <StatCard 
          title="Online Collected" 
          value={`₹${mockDashboardStats.todayOnline.toLocaleString('en-IN')}`} 
          icon={CreditCard} 
          colorClass="bg-purple-100 text-purple-600" 
        />
      </div>

      {/* Action Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-900">{mockDashboardStats.lowStockItems}</span> items are running low on stock.
            </p>
            <Link href="/inventory" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
              View Inventory →
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending AI Drafts</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-900">{mockDashboardStats.pendingDrafts}</span> consultation notes need your review.
            </p>
            <Link href="/ai-draft" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
              Review Drafts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable UI Component for the Stat Cards
function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) {
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