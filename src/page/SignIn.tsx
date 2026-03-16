import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AlertCircle, X, CheckCircle2 } from "lucide-react";

export default function SignIn() {
  // Main Sign In States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot Password Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "That email address doesn't look quite right.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a moment before trying again.";
      case "auth/network-request-failed":
        return "Check your internet connection and try again.";
      case "auth/internal-error":
        return "Server error. Please try again in a few seconds.";
      default:
        return "Something went wrong. Please check your details and try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      console.error("Auth Error:", err.code);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      // Auto-close modal after a delay so they can read the success message
      setTimeout(() => {
        setIsModalOpen(false);
        setResetSent(false);
        setResetEmail("");
      }, 6000);
    } catch (err: any) {
      // Security Standard: Even if the email doesn't exist, we show a success state 
      // to prevent account enumeration (hackers finding valid emails).
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden selection:bg-teal-100"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(184, 154, 122, 0) 0%, rgba(184, 154, 122, 0) 100%), linear-gradient(136.159deg, rgba(214, 242, 244, 0) 48.915%, rgb(167, 216, 255) 93.019%), linear-gradient(139.447deg, rgb(255, 255, 255) 0%, rgb(214, 242, 244) 50.018%)",
      }}
    >
      {/* Logo */}
      <div className="absolute left-6 top-6 sm:left-10 sm:top-8 z-10">
        <p className="font-['Sora',sans-serif] font-extralight text-black text-2xl sm:text-3xl tracking-tight">
          CurbSuite
        </p>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div
          className="
            relative
            w-full
            max-w-[520px]
            rounded-[2.5rem]
            bg-white/80
            backdrop-blur-2xl
            shadow-[0_40px_100px_rgba(0,0,0,0.07)]
            border border-white/50
            px-6 sm:px-12
            pt-16
            pb-12
            flex flex-col
          "
        >
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-red-400/20 blur-[100px] pointer-events-none" />

          {/* Neon Sign Header */}
          <div className="relative flex items-center justify-center mb-14 shrink-0">
            <div className="absolute w-[260px] h-[110px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner" />

            <div
              className="absolute w-[260px] h-[110px] rounded-2xl border-[3px] border-blue-600 rotate-[4deg]"
              style={{
                boxShadow: "0 0 20px rgba(37,99,235,0.6), inset 0 0 15px rgba(37,99,235,0.4)"
              }}
            />

            <div
              className="absolute w-[260px] h-[110px] rounded-2xl border-[3px] border-red-600 -rotate-[4deg]"
              style={{
                boxShadow: "0 0 20px rgba(220,38,38,0.7), inset 0 0 15px rgba(220,38,38,0.5)"
              }}
            />

            <h1
              className="relative z-10 font-light text-[54px] sm:text-[62px] tracking-tight leading-none select-none text-white"
              style={{
                WebkitTextStroke: "1.5px #FF1E1E",
                textShadow: `
                  0 0 5px #FFF,
                  0 0 10px #FFD1D1,
                  0 0 20px #FF4D4D,
                  0 0 40px #FF0000,
                  0 0 60px rgba(255, 0, 0, 0.4)
                `
              }}
            >
              Sign In
            </h1>
          </div>

          {/* Error Message Display */}
          <div className="min-h-[60px] mb-2">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-['Sora',sans-serif] font-medium text-red-700 leading-tight">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="ml-1 font-['Sora',sans-serif] text-xs font-semibold uppercase tracking-wider text-black/40">
                Business Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="h-[58px] rounded-2xl bg-white/60 px-5 text-black border border-black/5 outline-none focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="ml-1 font-['Sora',sans-serif] text-xs font-semibold uppercase tracking-wider text-black/40">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-[58px] rounded-2xl bg-white/60 px-5 text-black border border-black/5 outline-none focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
              />
            </div>

            {/* Forgot Password Link - Now opens Modal */}
            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-['Sora',sans-serif] font-semibold text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-[58px] w-full rounded-2xl bg-[#2E7D32] text-white font-medium text-lg shadow-xl shadow-green-900/10 hover:bg-[#1B5E20] hover:shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>

      {/* --- Forgot Password Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/50 animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {!resetSent ? (
              <>
                <h2 className="font-['Sora',sans-serif] text-2xl font-semibold text-gray-900 mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-500 text-sm font-['Sora',sans-serif] mb-8 leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>

                <form onSubmit={handleResetSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="ml-1 font-['Sora',sans-serif] text-xs font-semibold uppercase tracking-wider text-black/40">
                      Email Address
                    </label>
                    <input
                      autoFocus
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="h-[54px] rounded-xl bg-gray-50 px-5 text-black border border-black/5 outline-none focus:bg-white focus:border-[#2E7D32] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="h-[54px] w-full rounded-xl bg-[#2E7D32] text-white font-semibold shadow-lg hover:bg-[#1B5E20] disabled:opacity-70 transition-all active:scale-[0.98]"
                  >
                    {resetLoading ? "Sending Link..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 flex flex-col items-center animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#2E7D32]" />
                </div>
                <h2 className="font-['Sora',sans-serif] text-2xl font-semibold text-gray-900 mb-2">
                  Check your email
                </h2>
                <p className="text-gray-500 text-sm font-['Sora',sans-serif] leading-relaxed">
                  If an account exists for <span className="text-black font-medium">{resetEmail}</span>,
                  you will receive a password reset link shortly.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-8 text-sm font-semibold text-[#2E7D32] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}