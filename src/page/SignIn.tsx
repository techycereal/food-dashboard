// src/components/AuthForm.tsx
import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{
      backgroundImage:
        "linear-gradient(90deg, rgba(184, 154, 122, 0) 0%, rgba(184, 154, 122, 0) 100%), linear-gradient(136.159deg, rgba(214, 242, 244, 0) 48.915%, rgb(167, 216, 255) 93.019%), linear-gradient(139.447deg, rgb(255, 255, 255) 0%, rgb(214, 242, 244) 50.018%)",
    }}>

      {/* Logo */}
      <div className="absolute left-8 top-6 z-10">
        <p className="font-['Sora',sans-serif] font-extralight text-black text-2xl sm:text-3xl">
          CurbSuite
        </p>
      </div>

      {/* Center Card */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div
          className="
            relative
            w-full
            max-w-[560px]
            rounded-3xl
            bg-white/70
            backdrop-blur-xl
            shadow-[0_30px_80px_rgba(0,0,0,0.08)]
            px-8 sm:px-12
            pt-16
            pb-12
          "
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-red-300/30 blur-[120px]" />

          {/* Neon Sign */}
          <div className="relative flex items-center justify-center mb-16">

            {/* Backplate (glass panel behind neon) */}
            <div className="
    absolute
    w-[300px] h-[130px]
    rounded-2xl
    bg-white/10
    backdrop-blur-md
    shadow-inner
  " />

            {/* Blue Frame */}
            <div
              className="absolute w-[300px] h-[130px] rounded-2xl"
              style={{
                transform: "rotate(5deg)",
                border: "2px solid rgba(80,80,255,0.8)",
                boxShadow: `
        0 0 12px rgba(80,80,255,0.8),
        inset 0 0 12px rgba(80,80,255,0.6)
      `,
              }}
            />

            {/* Red Frame */}
            <div
              className="absolute w-[300px] h-[130px] rounded-2xl"
              style={{
                transform: "rotate(-5deg)",
                border: "2px solid rgba(255,80,80,0.9)",
                boxShadow: `
        0 0 14px rgba(255,80,80,0.9),
        inset 0 0 14px rgba(255,80,80,0.6)
      `,
              }}
            />

            {/* Neon Text */}
            <p
              className="
      relative z-10
      font-extralight
      text-[68px]
      tracking-wide
      leading-none
      select-none
    "
              style={{
                color: "#FFD1D1",
                WebkitTextStroke: "1px #FF3B3B",
                textShadow: `
        /* tube core */
        0 0 2px #FFFFFF,

        /* inner glow */
        0 0 6px #FFD1D1,
        0 0 12px #FF9E9E,

        /* outer glow */
        0 0 24px #FF6B6B,
        0 0 48px rgba(255, 80, 80, 0.9)
      `,
              }}
            >
              Sign In
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-['Sora',sans-serif] font-light text-black/70">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  h-[54px]
                  rounded-xl
                  bg-white
                  px-4
                  text-black
                  shadow-sm
                  border border-black/10
                  outline-none
                  focus:border-[#2E7D32]
                  focus:ring-2 focus:ring-[#2E7D32]/30
                "
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-['Sora',sans-serif] font-light text-black/70">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  h-[54px]
                  rounded-xl
                  bg-white
                  px-4
                  text-black
                  shadow-sm
                  border border-black/10
                  outline-none
                  focus:border-[#2E7D32]
                  focus:ring-2 focus:ring-[#2E7D32]/30
                "
              />
            </div>

            <button
              type="submit"
              className="
                mt-4
                h-[52px]
                w-fit
                px-10
                rounded-xl
                bg-[#2E7D32]
                text-white
                font-light
                shadow-md
                hover:bg-[#1B5E20]
                hover:shadow-lg
                transition
                active:scale-[0.98]
              "
            >
              Sign In
            </button>

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
