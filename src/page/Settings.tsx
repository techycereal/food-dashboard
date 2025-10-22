// src/components/Settings.tsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { clearAuth } from "../features/auth/authSlice";
import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
export default function Settings() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const success = 'Saved Business Name'
  const [time, setTime] = useState(false)
  const auth = useSelector(state => state.auth.token)
  
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      // 1️⃣ Tell backend to clear cookies/session
      await fetch("http://localhost:3001/logout", {
        method: "POST",
        credentials: "include",
      });

      // 2️⃣ Sign out from Firebase
      const auth = getAuth();
      await signOut(auth);

      // 3️⃣ Clear Redux state
      dispatch(clearAuth());

      // 4️⃣ Redirect
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

    const createName = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        await axios.post('http://localhost:3001/add_business_name', {name: businessName}, {headers: {"Authorization": `Bearer ${auth}`}})
        setBusinessName('')
        setTime(true)
        setTimeout(() => {
        setTime(false)
    }, 2000)
    }

  return (
    <div className="flex min-h-screen bg-[#b8f2f1]">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg flex flex-col gap-6">
          
          {/* Business Info Form */}
          <form className="flex flex-col gap-4" onSubmit={createName}>
            <h1 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
              Business Settings
            </h1>
            <div>
              <label className="block font-medium mb-1 text-sm sm:text-base">
                Business Name
              </label>
              <input
                className="p-2 sm:p-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter business name"
                onChange={(e) => setBusinessName(e.target.value)}
                value={businessName}
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Save
            </button>
          </form>
          <div className="text-center">
            {time && <p className={`text-green-400 font-bold transition ${time && `animate-fadeIn`}`}>{success}</p> }
          </div>
          {/* Logout */}
          <div className="flex justify-center">
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

