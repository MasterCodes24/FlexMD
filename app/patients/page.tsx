"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, User, Phone } from 'lucide-react';
import { mockPatients } from '../../src/mocks/mockData';

export default function PatientsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter patients based on search input
  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
          placeholder="Search by patient name or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patient List */}
      <div className="bg-white shadow-sm overflow-hidden rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Patient Info */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-semibold text-gray-900">{patient.name}</p>
                      <div className="flex flex-wrap text-sm text-gray-500 gap-x-4 mt-1">
                        <span className="flex items-center">
                          <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {patient.phone}
                        </span>
                        <span className="flex items-center border-l border-gray-300 pl-4">
                          <span className="font-medium mr-1 text-gray-700">Age:</span> {patient.age} | {patient.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    {/* HERE IS THE UPDATED BUTTON WRAPPED IN A LINK */}
                    <Link href={`/patients/${patient.id}`}>
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        View History
                      </button>
                    </Link>
                    <button className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                      + Add Visit
                    </button>
                  </div>

                </div>
              </div>
            </li>
          ))}
          
          {/* Empty State */}
          {filteredPatients.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500 text-sm">No patients found matching "{searchTerm}".</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}