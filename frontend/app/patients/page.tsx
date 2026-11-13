"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, User, Phone, Loader2, UserX } from "lucide-react";
import { patientsApi, type Patient } from "../../src/lib/api";
import AddPatientModal from "../../src/components/AddPatientModal";

export default function PatientsDirectory() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchPatients = async (q = "") => {
    setLoading(true);
    try {
      const data = await patientsApi.list(q);
      setPatients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePatientAdded = (patient: Patient) => {
    setShowModal(false);
    setPatients((prev) => [patient, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
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

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {/* Patient List */}
      <div className="bg-white shadow-sm overflow-hidden rounded-md border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-500">Loading patients...</span>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <li key={patient.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-base font-semibold text-gray-900">{patient.name}</p>
                        <div className="flex flex-wrap text-sm text-gray-500 gap-x-4 mt-1">
                          {patient.phone && (
                            <span className="flex items-center">
                              <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {patient.phone}
                            </span>
                          )}
                          {(patient.age || patient.gender) && (
                            <span className="flex items-center border-l border-gray-300 pl-4">
                              {patient.age && <span className="font-medium mr-1 text-gray-700">Age: {patient.age}</span>}
                              {patient.gender && <span>| {patient.gender}</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link href={`/patients/${patient.id}`}>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          View History
                        </button>
                      </Link>
                      <Link href={`/patients/${patient.id}/add-visit`}>
                        <button className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                          + Add Visit
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {!loading && patients.length === 0 && (
              <div className="px-4 py-16 text-center">
                <UserX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? `No patients found matching "${searchTerm}".` : "No patients yet. Add your first patient!"}
                </p>
              </div>
            )}
          </ul>
        )}
      </div>

      {showModal && <AddPatientModal onClose={() => setShowModal(false)} onAdded={handlePatientAdded} />}
    </div>
  );
}
