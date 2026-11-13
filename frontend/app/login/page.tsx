"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Stethoscope, Loader2, RefreshCw, CheckCircle } from "lucide-react";
import { authApi } from "../../src/lib/api";
import { setToken, setClinic, setPendingEmail, getPendingEmail, clearPendingEmail } from "../../src/lib/auth";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);
  const otpFilled = otp.every((d) => d !== "");

  // Auto-verify when all digits entered
  useEffect(() => {
    if (otpFilled) {
      const t = setTimeout(() => handleVerify(), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  useEffect(() => {
    if (step === 2) setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await authApi.login({ email, password });
      setPendingEmail(email);
      // Show dev OTP in UI during development
      if (data.dev_otp) setDevOtp(data.dev_otp);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const updated = [...otp];
        updated[index] = "";
        setOtp(updated);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
        const updated = [...otp];
        updated[index - 1] = "";
        setOtp(updated);
      }
    }
  };

  const handleVerify = async () => {
    if (!otpFilled || isVerifying) return;
    setIsVerifying(true);
    setOtpError("");
    try {
      const pendingEmail = getPendingEmail() || email;
      const data = await authApi.verifyOtp({ email: pendingEmail, otp: otp.join("") });
      setToken(data.token);
      setClinic(data.clinic);
      clearPendingEmail();
      router.push("/dashboard");
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Incorrect OTP. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setDevOtp(null);
    try {
      const data = await authApi.login({ email, password });
      if (data.dev_otp) setDevOtp(data.dev_otp);
    } catch {
      // silent
    }
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  // ── STEP 1: Login form ────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Stethoscope size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">ClinicFlow AI</span>
          </div>

          {justRegistered && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
              <CheckCircle size={16} />
              Clinic registered successfully! Please log in.
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your clinic dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="doctor@clinic.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-11 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin mr-2" />Verifying...</>
              ) : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            New clinic?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── STEP 2: OTP ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >←</button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><Stethoscope size={22} /></div>
            <span className="text-lg font-bold text-gray-900">ClinicFlow AI</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">OTP Verification</h1>
        <p className="text-sm text-gray-500 mb-2">Enter the 6-digit OTP sent to your registered mobile</p>

        {/* Dev OTP hint */}
        {devOtp && (
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-mono">
            🔑 Dev OTP: <strong>{devOtp}</strong>
          </div>
        )}

        {otpError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {otpError}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900 bg-white"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={!otpFilled || isVerifying}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <><Loader2 size={18} className="animate-spin mr-2" />Verifying...</>
          ) : "Verify OTP"}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={13} /> Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
