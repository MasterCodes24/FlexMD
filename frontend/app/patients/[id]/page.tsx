"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Calendar, FileText, Pill,
  IndianRupee, CreditCard, Wallet, Loader2, UserX
} from "lucide-react";
import { patientsApi, type PatientWithVisits, type Visit } from "../../../src/lib/api";

export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientWithVisits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    patientsApi.get(patientId)
      .then(setPatient)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (error || !patient) return (
    <div className="p-6 text-center">
      <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-gray-900">Patient not found</h2>
      <p className="text-sm text-gray-500 mt-1">{error}</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline text-sm">
        Go back
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <p className="text-sm text-gray-500">
              ID: {patient.id}
              {patient.phone && ` | Ph: ${patient.phone}`}
              {patient.age && ` | ${patient.age} yrs`}
              {patient.gender && ` | ${patient.gender}`}
            </p>
          </div>
        </div>
        <Link href={`/patients/${patient.id}/add-visit`}>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Record New Visit
          </button>
        </Link>
      </div>

      {/* Visit History Timeline */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
          Visit History ({patient.visits?.length ?? 0} visits)
        </h2>

        {!patient.visits || patient.visits.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No past visits recorded for this patient.</p>
            <Link href={`/patients/${patient.id}/add-visit`} className="text-blue-600 text-sm hover:underline mt-2 inline-block">
              Add first visit →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {patient.visits.map((visit: Visit) => (
              <div key={visit.id} className="relative pl-6 sm:pl-8 border-l-2 border-blue-100 last:border-transparent">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-white" />
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100">
                  {/* Date & Payment */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-200 pb-3">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      {new Date(visit.visit_date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        {Number(visit.charges).toLocaleString("en-IN")}
                      </span>
                      <span className="inline-flex items-center text-xs font-medium text-gray-600 capitalize">
                        {visit.payment_mode === "online"
                          ? <CreditCard className="w-3 h-3 mr-1" />
                          : <Wallet className="w-3 h-3 mr-1" />}
                        {visit.payment_mode}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Details */}
                  <div className="space-y-3">
                    {(visit.problem || visit.diagnosis_or_solution) && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                          <FileText className="w-3 h-3 mr-1" /> Problem & Diagnosis
                        </h4>
                        {visit.problem && <p className="text-sm text-gray-800"><span className="font-medium">Complaint:</span> {visit.problem}</p>}
                        {visit.diagnosis_or_solution && <p className="text-sm text-gray-800"><span className="font-medium">Diagnosis:</span> {visit.diagnosis_or_solution}</p>}
                      </div>
                    )}

                    {visit.medicines && visit.medicines.length > 0 && (
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
                    )}

                    {visit.advice && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Advice</h4>
                        <p className="text-sm text-gray-800">{visit.advice}</p>
                      </div>
                    )}

                    {visit.follow_up_date && (
                      <div className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        <Calendar className="w-3 h-3" />
                        Follow-up: {new Date(visit.follow_up_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
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
