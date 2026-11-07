import Link from 'next/link';
import { Clock, Sparkles, BarChart2, Shield, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">ClinicFlow AI</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Register Clinic
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ─── Hero Section ─── */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-24 translate-x-24 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 opacity-10 rounded-full translate-y-16 -translate-x-16 blur-2xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white/90">Powered by Gemini AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Less paperwork.
              <br />
              <span className="text-yellow-300">More time for patients.</span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              ClinicFlow AI automates the entire visit workflow — from voice capture to billing — so Indian doctors can focus on what matters most.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
              >
                Register Clinic — Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold text-base rounded-xl hover:bg-white/20 transition-all"
              >
                Login to Dashboard
              </Link>
            </div>

            {/* Social proof */}
            <p className="text-blue-200 text-sm mt-10">
              Trusted by 200+ clinics across Maharashtra · No credit card required
            </p>
          </div>
        </section>

        {/* ─── Value Proposition Grid ─── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Built for the busy Indian clinic
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Three powerful modules that eliminate the administrative burden from your practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-1 transform transition-all group">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <Clock className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  60-Second Visit Capture
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  From consultation to record in under a minute
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Speak your notes naturally. ClinicFlow AI transcribes, structures, and stores the full visit record — no typing required.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-1 transform transition-all group">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <Sparkles className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  AI-Drafted Notes
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Gemini drafts. You review. You approve.
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Every note is AI-drafted but doctor-approved. The AI never acts without your explicit sign-off — full clinical control stays with you.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-1 transform transition-all group">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                  <BarChart2 className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  Automated Revenue &amp; Inventory
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Every visit auto-updates your books and stock
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Revenue is logged to the rupee. Inventory deducted automatically. Get a full daily AI summary at close of day — no accountant needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust & Compliance Banner ─── */}
        <section className="py-16 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Built on a foundation of trust
              </h2>
              <p className="text-slate-400 text-base max-w-lg mx-auto">
                Patient data privacy is not a feature — it's our architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Trust Item 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-white mb-1">Doctor-Controlled AI</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  No action is taken without explicit doctor approval. The AI is a tool, not an agent.
                </p>
              </div>

              {/* Trust Item 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-bold text-white mb-1">DPDP Act 2023 Compliant</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Explicit consent captured at registration. Data processed only as a designated fiduciary.
                </p>
              </div>

              {/* Trust Item 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-white mb-1">End-to-End Encrypted</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  All patient records are encrypted at rest and in transit. Zero third-party access.
                </p>
              </div>

              {/* Trust Item 4 */}
              <div className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white mb-1">India-First Data Residency</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your patient data never leaves Indian servers. Fully MCI and IMA guideline-aware.
                </p>
              </div>
            </div>

            {/* Compliance strip */}
            <div className="mt-12 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield className="w-5 h-5 text-blue-400" />
                Doctor-Controlled AI
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle className="w-5 h-5 text-green-400" />
                DPDP Act 2023 Compliant Data Storage
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield className="w-5 h-5 text-purple-400" />
                ISO 27001 Standards
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to transform your clinic?
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              Join hundreds of doctors who've reclaimed their evenings. Set up in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                Register Clinic — Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/40 text-white font-semibold text-base rounded-xl hover:bg-white/10 transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-blue-500 font-bold text-lg">ClinicFlow AI</span>
          <p className="text-sm">© 2026 ClinicFlow AI. Built for Indian Healthcare.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
