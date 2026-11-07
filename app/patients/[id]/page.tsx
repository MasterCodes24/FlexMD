"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Calendar, FileText, Pill, IndianRupee, CreditCard, Wallet } from 'lucide-react';
import { mockPatients, mockVisits } from '../../../src/mocks/mockData';

export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  // Find the specific patient and their visits from our mock data
  const patient = mockPatients.find(p => p.id === patientId);
  const visits = mockVisits.filter(v => v.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">Patient not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with Back Button and Patient Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-500">ID: {patient.id} | Ph: {patient.phone} | {patient.age} yrs | {patient.gender}</p>
          </div>
        </div>
        
        {/* THIS IS THE UPDATED BUTTON WRAPPED IN A LINK */}
        <Link href={`/patients/${patient.id}/add-visit`}>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Record New Visit
          </button>
        </Link>
      </div>

      {/* Visit History Timeline */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Visit History</h2>
        
        {visits.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No past visits recorded for this patient.</p>
        ) : (
          <div className="space-y-8">
            {visits.map((visit) => (
              <div key={visit.id} className="relative pl-6 sm:pl-8 border-l-2 border-blue-100 last:border-transparent">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-white"></div>
                
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100">
                  {/* Visit Date & Payment */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-200 pb-3">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      {new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        {visit.charges}
                      </span>
                      <span className="inline-flex items-center text-xs font-medium text-gray-600 capitalize">
                        {visit.payment_mode === 'online' ? <CreditCard className="w-3 h-3 mr-1" /> : <Wallet className="w-3 h-3 mr-1" />}
                        {visit.payment_mode}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Details */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                        <FileText className="w-3 h-3 mr-1" /> Problem & Diagnosis
                      </h4>
                      <p className="text-sm text-gray-800"><span className="font-medium">Complaint:</span> {visit.problem}</p>
                      <p className="text-sm text-gray-800"><span className="font-medium">Diagnosis:</span> {visit.diagnosis_or_solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                        <Pill className="w-3 h-3 mr-1" /> Prescribed Medicines
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-800">
                        {visit.medicines.map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}