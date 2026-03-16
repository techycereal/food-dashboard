import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { clearAuth, setCredentials } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { addName } from "../features/products/productSlice";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { resetProductsState } from "../features/products/productSlice";
import { resetEmailsState } from "../features/emails/emailsSlice";
import { resetOffersState } from "../features/offers/offerSlice";
import { resetReportsState } from "../features/reports/reportSlice";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inventoryCode, setInventoryCode] = useState("");
  const [codeSaved, setCodeSaved] = useState(false);
  const [saved, setSaved] = useState(false);

  // Redux Selectors
  const cachedName = useSelector((state: RootState) => state.products.name);
  const auths = useSelector((state: RootState) => state.auth.token);
  const [businessName, setBusinessName] = useState(cachedName || "");

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        dispatch(setCredentials({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          },
          token,
        }));
      } else {
        // CLEAR LOCAL STATE HERE
        setBusinessName("");
        setInventoryCode("");
        dispatch(clearAuth());
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, [dispatch, navigate]);

  // Fetch Business Name if not in cache
  useEffect(() => {
    const fetchBusinessName = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const response = await axios.get(`${apiUrl}/get_name`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBusinessName(response.data.message);
        dispatch(addName(response.data.message));
      } catch (err) {
        console.error("Error fetching business name:", err);
      }
    };

    if (cachedName.length < 1) {
      fetchBusinessName();
    }
  }, [cachedName, dispatch, auth.currentUser?.uid]);

  const handleLogout = async () => {
    try {
      // Notify server
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${auths}` }
      });

      // Sign out Firebase
      await signOut(auth);

      // 2. DISPATCH ALL RESET ACTIONS
      dispatch(clearAuth());
      dispatch(resetProductsState());
      dispatch(resetEmailsState());
      dispatch(resetOffersState());
      dispatch(resetReportsState());

      // 3. Navigate
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSaveName = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      await axios.post(`${apiUrl}/add_business_name`,
        { name: businessName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(addName(businessName));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCode = async () => {
    try {
      await axios.post(`${apiUrl}/saveCode`,
        { inventoryCode },
        { headers: { Authorization: `Bearer ${auths}` } }
      );
      console.log('CODE SAVED')
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{
      backgroundImage:
        "linear-gradient(137.884deg, rgba(222,242,243,1) 0%, rgb(214,242,244) 50.018%)",
    }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 md:hidden z-50 p-3 bg-white rounded-xl shadow-lg border border-teal-100"
        >
          <Menu className="w-6 h-6 text-teal-600" />
        </button>
      )}

      {/* Main Content: md:ml-64 ensures it doesn't hide behind the sidebar */}
      <div className="flex-1 flex flex-col items-center w-full md:ml-64 transition-all duration-300">
        <div className="w-full max-w-lg flex flex-col gap-8 p-6 py-16 md:py-12">

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 text-sm">Update your business details and backup codes.</p>
          </div>

          {/* 1. Plaque Section */}
          <section className="relative">
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#844e22] shadow-2xl p-[4%]">
              <div className="w-full h-full bg-[#f0e68c] p-[3%] rounded-sm">
                <div className="w-full h-full bg-[#141414] flex flex-col items-center text-center text-[#ebe6b9] p-6 relative overflow-hidden">
                  <p className="mt-8 font-['Italianno',cursive] text-2xl">With Our Greatest</p>
                  <p className="font-['Platypi',serif] text-xl tracking-widest uppercase">Appreciation</p>

                  <div className="mt-10 flex flex-col items-center w-full">
                    <p className="font-['Sora',sans-serif] text-[10px] font-bold opacity-60 uppercase tracking-tighter">We Honor</p>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Business Name"
                      className="w-full mt-2 font-['Sora',sans-serif] font-bold text-xl text-center bg-transparent border-b border-[#f0e68c]/20 focus:border-[#f0e68c] focus:outline-none py-1"
                    />
                  </div>

                  <p className="mt-8 font-['Platypi',serif] text-sm leading-relaxed max-w-[80%] opacity-90">
                    In Recognition for Your Partnership With CurbSuite
                  </p>

                  <p className="mt-auto mb-6 font-['Italianno',cursive] text-5xl">Thank You!</p>

                  <button
                    onClick={handleSaveName}
                    className="absolute bottom-4 right-4 bg-[#f0e68c] text-black text-[10px] font-black px-3 py-1.5 rounded-md hover:bg-white active:scale-95 transition-all"
                  >
                    {saved ? "✓ SAVED" : "SAVE NAME"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Inventory Code Section */}
          <section className="bg-white rounded-3xl shadow-xl p-8 border border-white/60">
            <h2 className="text-xl font-bold text-gray-800">Offline Inventory Code</h2>
            <p className="text-sm text-gray-500 mb-6">Set a 6-digit code for offline stock management.</p>

            <div className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={inventoryCode}
                onChange={(e) => setInventoryCode(e.target.value.replace(/\D/g, ""))}
                placeholder="— — — — — —"
                className="w-full text-center tracking-[0.6em] text-3xl font-mono border-2 border-gray-100 rounded-2xl p-5 focus:border-teal-400 focus:outline-none transition-all"
              />

              <button
                onClick={handleSaveCode}
                disabled={inventoryCode.length !== 6}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-100 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
              >
                Update Access Code
              </button>

              {/* This message will now reliably re-trigger on every successful click */}
              <div className="h-6">
                {codeSaved && (
                  <p className="text-green-600 text-center text-sm font-semibold animate-bounce">
                    ✓ Code updated successfully
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 3. Account Action Section */}
          <section className="flex flex-col gap-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-500 border-2 border-red-100 hover:bg-red-100 py-4 rounded-2xl font-bold transition-all flex items-center justify-center"
            >
              Log Out of CurbSuite
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}