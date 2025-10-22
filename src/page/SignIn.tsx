// src/components/AuthForm.tsx
import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/')
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#b8f2f1] p-4">
      {/* Chalkboard background */}
      <div className="bg-[#8B5E3C] w-[70vh] h-auto h-[80vh] shadow-xl flex items-center justify-center p-4 rounded-2xl">
        {/* Form (wooden board) */}
        <form
          onSubmit={handleSubmit}
          className="bg-black w-full h-full p-6 md:p-8 flex flex-col items-center justify-center gap-6 text-white rounded-xl"
        >
          {/* Sign / Title */}
          <h1 className="font-cabin text-5xl sm:text-6xl md:text-7xl font-extrabold text-center mb-6 border-b border-white pb-2">
            Sign In
          </h1>

          {/* Form Fields */}
          <div className="flex flex-col gap-4 items-center w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-cabin font-bold text-base sm:text-lg w-full max-w-[400px] px-4 py-3 
                        border-b-2 border-dashed border-white 
                        bg-transparent text-white placeholder-white 
                        focus:outline-none focus:ring-0 tracking-wide"
              required
            />
            <input
              type="password"
              placeholder="Password (6+ chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-cabin font-bold text-base sm:text-lg w-full max-w-[400px] px-4 py-3 
                        border-b-2 border-dashed border-white 
                        bg-transparent text-white placeholder-white 
                        focus:outline-none focus:ring-0 tracking-wide"
              required
            />
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full max-w-[200px] mt-6 py-3 
                      font-cabin font-bold text-base sm:text-lg tracking-wide 
                      bg-transparent text-white border-2 border-dashed border-white 
                      rounded-md hover:bg-white hover:text-black hover:scale-105 
                      transition-transform duration-200"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          {/* Toggle Sign In / Sign Up */}
          <p
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs sm:text-sm text-white cursor-pointer text-center mt-4"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
            <Link key={0} to={"/"} className="underline ml-1">
              Offers
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
