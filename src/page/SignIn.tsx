// src/components/SignIn.tsx
import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react"; // Optional: for a nicer error icon

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mapping Firebase technical codes to user-friendly language
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
          {/* Ambient Glow behind the card */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-red-400/20 blur-[100px] pointer-events-none" />

          {/* Neon Sign Header */}
          <div className="relative flex items-center justify-center mb-14 shrink-0">
            {/* Glass Backplate */}
            <div className="absolute w-[260px] h-[110px] rounded-2xl bg-white/5 backdrop-blur-sm shadow-inner border border-white/10" />

            {/* Blue Neon Frame */}
            <div
              className="absolute w-[260px] h-[110px] rounded-2xl"
              style={{
                transform: "rotate(4deg)",
                border: "2px solid rgba(80,80,255,0.7)",
                boxShadow: "0 0 15px rgba(80,80,255,0.5), inset 0 0 10px rgba(80,80,255,0.3)",
              }}
            />

            {/* Red Neon Frame */}
            <div
              className="absolute w-[260px] h-[110px] rounded-2xl"
              style={{
                transform: "rotate(-4deg)",
                border: "2px solid rgba(255,80,80,0.8)",
                boxShadow: "0 0 15px rgba(255,80,80,0.6), inset 0 0 10px rgba(255,80,80,0.4)",
              }}
            />

            {/* Neon "Sign In" Text */}
            <h1
              className="
                relative z-10
                font-extralight
                text-[54px] sm:text-[62px]
                tracking-tight
                leading-none
                select-none
              "
              style={{
                color: "#FFD1D1",
                WebkitTextStroke: "1px #FF3B3B",
                textShadow: `
                  0 0 2px #FFFFFF,
                  0 0 8px #FFD1D1,
                  0 0 15px #FF6B6B,
                  0 0 35px rgba(255, 80, 80, 0.6)
                `,
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
                className="
                  h-[58px]
                  rounded-2xl
                  bg-white/60
                  px-5
                  text-black
                  border border-black/5
                  outline-none
                  focus:bg-white
                  focus:border-[#2E7D32]
                  focus:ring-4 focus:ring-[#2E7D32]/5
                  transition-all
                "
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
                className="
                  h-[58px]
                  rounded-2xl
                  bg-white/60
                  px-5
                  text-black
                  border border-black/5
                  outline-none
                  focus:bg-white
                  focus:border-[#2E7D32]
                  focus:ring-4 focus:ring-[#2E7D32]/5
                  transition-all
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                mt-4
                h-[58px]
                w-full
                rounded-2xl
                bg-[#2E7D32]
                text-white
                font-medium
                text-lg
                shadow-xl shadow-green-900/10
                hover:bg-[#1B5E20]
                hover:shadow-green-900/20
                disabled:opacity-70
                disabled:cursor-not-allowed
                transition-all
                active:scale-[0.98]
              "
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}