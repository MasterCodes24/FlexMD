"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Loader2, RefreshCw } from "lucide-react";

export default function OtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null]);

  const otpFilled = otp.every((d) => d !== "");

  // Auto-verify when all digits are entered
  useEffect(() => {
    if (otpFilled) {
      const timer = setTimeout(() => handleVerify(), 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
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

  const handleVerify = () => {
    if (!otpFilled || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleResend = () => {
    setOtp(["", "", "", ""]);
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-bold text-gray-900">ClinicFlow AI</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">OTP Verification</h1>
        <p className="text-sm text-gray-500 mb-8">
          Enter the 4-digit OTP sent to your registered mobile
        </p>

        {/* OTP inputs */}
        <div className="flex justify-center gap-3 mb-8">
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
              className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={!otpFilled || isVerifying}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend */}
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={13} />
            Resend OTP
          </button>
        </div>

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Go back to{" "}
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
