import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getAuth, signOut } from "firebase/auth";
import { clearAuth } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { addName } from "../features/products/productSlice";
import { Menu } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
export default function Settings() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false);

  const cachedName = useSelector((state: RootState) => state.products.name);
  const [businessName, setBusinessName] = useState(
    cachedName.length > 0 ? cachedName : ""
  );
  const [saved, setSaved] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        console.log(token)
        dispatch(
          setCredentials({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            },
            token,
          })
        );
      } else {
        dispatch(clearAuth());
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  useEffect(() => {
    const name = async () => {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const response = await axios.get('http://localhost:3001/get_name', { headers: { Authorization: `Bearer ${token}` } })
      setBusinessName(response.data.message)
      dispatch(addName(response.data.message))
    }
    if (cachedName.length < 1) {
      console.log('here')
      name()
    }
  }, [auth])


  const logout = async () => {
    try {
      await fetch("http://localhost:3001/logout", {
        method: "POST",
        credentials: "include",
      });

      const auth = getAuth();
      await signOut(auth);
      dispatch(clearAuth());

      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const saveName = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const token = await user.getIdToken();
    await axios.post(
      "http://localhost:3001/add_business_name",
      { name: businessName },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch(addName(businessName));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="min-h-screen w-full flex bg-[#b8f2f1]"
      style={{
        backgroundImage:
          "linear-gradient(137.884deg, rgba(222,242,243,1) 0%, rgb(214,242,244) 50.018%)",
      }}
    >
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {!mobileOpen && (
        <div className="absolute top-4 left-4 md:hidden z-40">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded bg-white shadow-md"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 figma-noise">
        {/* Plaque */}
        <div className="relative w-full max-w-[426px] aspect-[426/552] mx-auto">
          {/* Frames */}
          <div className="absolute inset-0 rounded-lg bg-[#844e22] shadow-lg" />
          <div className="absolute inset-[3.5%] bg-[#f0e68c]" />
          <div className="absolute inset-[6.5%] bg-[#141414]" />

          {/* Content */}
          <div className="absolute inset-[6.5%] flex flex-col items-center text-center text-[#ebe6b9] px-4">
            <p className="mt-[14%] font-['Italianno',cursive] text-[clamp(18px,4vw,24px)]">
              With Our Greatest
            </p>

            <p className="font-['Platypi',serif] text-[clamp(18px,4vw,24px)]">
              APPRECIATION
            </p>

            <p className="mt-[8%] font-['Sora',sans-serif] font-bold text-[clamp(14px,3vw,16px)]">
              We Honor
            </p>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
              className="font-['Sora',sans-serif] font-bold text-[clamp(16px,3.5vw,20px)] text-center bg-[#141414] b-[#f0e68c]"
            />

            <div className="mt-2 w-[60%] h-1 bg-[#ebe6b9]" />

            <p className="mt-[8%] font-['Platypi',serif] text-[clamp(14px,3.5vw,20px)] leading-snug max-w-[85%]">
              In Recognition for Your Partnership With CurbSuite
            </p>

            <p className="mt-auto mb-[10%] font-['Italianno',cursive] text-[clamp(28px,6vw,40px)]">
              Thank You!
            </p>
            <button
              onClick={saveName}
              className="absolute right-2 bottom-2 bg-[#f0e68c] text-gray-700 px-2 py-1 rounded"
            >
              Save
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 w-full max-w-sm">



          {saved && (
            <p className="text-center text-green-500 font-bold animate-fadeIn">
              Saved Business Name
            </p>
          )}

          <button
            onClick={logout}
            className="absolute right-4 p-2 bottom-4 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
