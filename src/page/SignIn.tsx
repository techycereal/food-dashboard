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

  // return (
  //   <div className="flex justify-center items-center min-h-screen bg-[#b8f2f1] p-4">
  //     {/* Chalkboard background */}
  //     <div className="bg-[#8B5E3C] w-[70vh] h-auto h-[80vh] shadow-xl flex items-center justify-center p-4 rounded-2xl">
  //       {/* Form (wooden board) */}
  //       <form
  //         onSubmit={handleSubmit}
  //         className="bg-black w-full h-full p-6 md:p-8 flex flex-col items-center justify-center gap-6 text-white rounded-xl"
  //       >
  //         {/* Sign / Title */}
  //         <h1 className="font-cabin text-5xl sm:text-6xl md:text-7xl font-extrabold text-center mb-6 border-b border-white pb-2">
  //           Sign In
  //         </h1>

  //         {/* Form Fields */}
  //         <div className="flex flex-col gap-4 items-center w-full">
  //           <input
  //             type="email"
  //             placeholder="Email"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //             className="font-cabin font-bold text-base sm:text-lg w-full max-w-[400px] px-4 py-3 
  //                       border-b-2 border-dashed border-white 
  //                       bg-transparent text-white placeholder-white 
  //                       focus:outline-none focus:ring-0 tracking-wide"
  //             required
  //           />
  //           <input
  //             type="password"
  //             placeholder="Password (6+ chars)"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //             className="font-cabin font-bold text-base sm:text-lg w-full max-w-[400px] px-4 py-3 
  //                       border-b-2 border-dashed border-white 
  //                       bg-transparent text-white placeholder-white 
  //                       focus:outline-none focus:ring-0 tracking-wide"
  //             required
  //           />
  //           {error && (
  //             <p className="text-red-500 text-sm text-center mt-2">{error}</p>
  //           )}
  //         </div>

  //         {/* Submit Button */}
  //         <button
  //           type="submit"
  //           className="w-full max-w-[200px] mt-6 py-3 
  //                     font-cabin font-bold text-base sm:text-lg tracking-wide 
  //                     bg-transparent text-white border-2 border-dashed border-white 
  //                     rounded-md hover:bg-white hover:text-black hover:scale-105 
  //                     transition-transform duration-200"
  //         >
  //           {isSignUp ? "Sign Up" : "Sign In"}
  //         </button>

  //         {/* Toggle Sign In / Sign Up */}
  //         <p
  //           onClick={() => setIsSignUp(!isSignUp)}
  //           className="text-xs sm:text-sm text-white cursor-pointer text-center mt-4"
  //         >
  //           {isSignUp
  //             ? "Already have an account? Sign in"
  //             : "Don't have an account? Sign up"}
  //           <Link key={0} to={"/"} className="underline ml-1">
  //             Offers
  //           </Link>
  //         </p>
  //       </form>
  //     </div>
  //   </div>
  // );
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(184, 154, 122, 0) 0%, rgba(184, 154, 122, 0) 100%), linear-gradient(136.159deg, rgba(214, 242, 244, 0) 48.915%, rgb(167, 216, 255) 93.019%), linear-gradient(139.447deg, rgb(255, 255, 255) 0%, rgb(214, 242, 244) 50.018%)",
        }}
      />

      {/* Logo */}
      <div className="absolute left-8 top-4 z-10">
        <p className="font-['Sora',sans-serif] font-extralight text-black text-[28px] sm:text-[36px]">
          CurbSuite
        </p>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-0">
        {/* Sign In Frames + Title */}
        {/* Sign In Frames + Title */}
        <div className="relative flex items-center justify-center mb-24 md:mb-32">
          {/* Blue Frame */}
          <div
            className="absolute w-[70vw] sm:w-[90vw] max-w-[280px] sm:max-w-[400px] h-[28vw] sm:h-[36vw] max-h-[120px] sm:max-h-[160px]"
            style={{
              transform: 'rotate(7.385deg) skewX(1.852deg)',
              boxShadow: '0 0 5px #0505FF, 0 0 10px #0505FF',
              border: '2px solid #0505FF'
            }}
          />

          {/* Red Frame */}
          <div
            className="absolute w-[70vw] sm:w-[90vw] max-w-[280px] sm:max-w-[400px] h-[28vw] sm:h-[36vw] max-h-[120px] sm:max-h-[160px]"
            style={{
              transform: 'rotate(-7.382deg) skewX(-1.851deg)',
              boxShadow: '0 0 5px #FF0505, 0 0 10px #FF0505',
              border: '2px solid #FF0505'
            }}
          />

          {/* Neon Sign In Text */}
          <p
            className="
      relative z-10
      font-extralight
      text-[#FFAEAE]      /* base pink color */
      text-[8vw] text-[48px] 
      md:text-[96px]
      leading-none text-center
    "
            style={{
              WebkitTextStroke: '1px #FF0F0F', // optional outline like before
              textShadow: `
        0 0 5px #FFAEAE,
        0 0 10px #FFAEAE,
        0 0 20px #FFAEAE,
        0 0 40px #FFAEAE,
        0 0 60px #FF6B6B
      `,
            }}
          >
            Sign In
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-[500px]"
        >
          {/* Email */}
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="email"
              className="font-['Sora',sans-serif] font-extralight text-black text-xl lg:text-3xl"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
            h-[50px] sm:h-[68px]
            w-full
            bg-white px-4
            font-['Sora',sans-serif]
            outline-none
            focus:ring-2 focus:ring-blue-500
            shadow-lg
          "
              style={{ fontSize: '18px' }}
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="password"
              className="font-['Sora',sans-serif] font-extralight text-black text-xl lg:text-3xl"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
            h-[50px] sm:h-[68px]
            w-full
            bg-white px-4
            font-['Sora',sans-serif]
            outline-none
            focus:ring-2 focus:ring-blue-500
            shadow-lg
          "
              style={{ fontSize: '18px' }}
              required
            />
          </div>

          <div className="w-full flex">
            <button
              type="submit"
              className="
      mt-4 sm:mt-6
      p-3
      bg-[#2E7D32]       /* forest green */
hover:bg-[#1B5E20] /* darker shade for hover */
text-white
      font-['Sora',sans-serif] font-extralight
      text-xl
      self-start
      shadow-lg
      rounded-md
    "
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
