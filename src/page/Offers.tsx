// Offers.tsx
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmails } from "../features/emails/emailsSlice";
import {
  fetchOffers,
  saveOffers,
  toggleDeal,
  
} from "../features/offers/offerSlice";
import type { RootState, AppDispatch } from "../app/store";
import { PiSquareLogoFill } from "react-icons/pi";
import { Menu } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { clearAuth, setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import DrinkModal from "../components/DrinkModal";

type DealType = {
  [key: string]: {
    name: string;
    future: string | null;
    show: number;
  }
}

export default function Offers() {
  const dispatch = useDispatch<AppDispatch>();
  const [mobileOpen, setMobileOpen] = useState(false);

  const emails = useSelector((state: RootState) => state.emails.emails);
  const emailStatus = useSelector((state: RootState) => state.emails.status);
  const offers = useSelector(
    (state: RootState) => state.offers.selectedDeals.deals
  );
  const offerId = useSelector(
    (state: RootState) => state.offers.selectedDeals.id
  );
  const offerStatus = useSelector(
    (state: RootState) => state.offers.status
  );
  const navigate = useNavigate()

  const [squareConnected, setSquareConnected] = useState<boolean | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drinkModal, setDrinkModal] = useState(false)

useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:3001/square/customers", {
        credentials: "include",
      });
      if (response.status === 401) {
        setSquareConnected(false);
        return;
      }
      const data = await response.json();
      setCustomers(data.customers || []);
      setSquareConnected(true);
    } catch (err) {
      console.error("Square fetch failed:", err);
      setSquareConnected(false);
    }
  };

  fetchCustomers();
}, []);


  const { user } = useSelector((state: any) => state.auth);
    useEffect(() => {
      const auth = getAuth();
  
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log(firebaseUser)
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken(true);
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
          console.log(emails.length)
          console.log(offers.length)
          if (emails.length === 0) dispatch(fetchEmails());
          if (Object.keys(offers).length === 0) dispatch(fetchOffers());
        } else {
          dispatch(clearAuth());
          navigate("/signin");
        }
      });
  
      return () => unsubscribe();
    }, [dispatch, navigate]);

    if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#b8f2f1]">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  const deals: DealType = {
    "Free drink with any meal": {name: "Free drink with any meal", future: 'null', show: 1},
    "10% off your next purchase": {name: "10% off your next purchase", future: "10% off", show: 1},
  };

  const getCustomers = async () => {
    try {
      const response = await fetch("http://localhost:3001/square/customers", {
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="h-screen w-full bg-[#b8f2f1] flex">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Menu Button */}
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
      {drinkModal && (
        <div>
          <DrinkModal setDrinkModal={setDrinkModal}/>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Customer Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage deals, customer emails, and Square integration.
          </p>
        </div>

        {/* Grid Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Select Offers */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Select Deals
            </h2>
            <ul className="space-y-3">
              {Object.keys(deals).map((deal) => (
                <li key={deal} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3 w-5 h-5 accent-green-500"
                    checked={deal in offers}
                    onChange={() => dispatch(toggleDeal({name: deal, future: deals[deal].future as string, show: deals[deal].show}))}
                  />
                  <span className="text-gray-700">{deal}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => dispatch(saveOffers({ deals, id: offerId }))}
              className="mt-6 w-full px-5 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
            >
              {offerStatus === "loading" ? "Saving..." : "Save Offers"}
            </button>
          </div>

          {/* Selected Deals */}
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
  <h2 className="text-2xl font-semibold text-gray-800 mb-5 text-center">
    🎉 Selected Deals
  </h2>
            
  {Object.keys(offers).length === 0 ? (
    <p className="text-gray-500 text-center italic">
      No deals selected yet.
    </p>
  ) : (
    <ul className="space-y-3">
      {Object.keys(offers).map((deal) => (
        <li
          key={deal}
          className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-100 transition-all"
        >
          <span className="text-gray-800 font-medium">{deal}</span>

          {deal === "Free drink with any meal" && (
            <button
              onClick={() => setDrinkModal(true)}
              className="text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Select Drink
            </button>
          )}
        </li>
      ))}
    </ul>
  )}
</div>
          {/* Emails */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Emails</h2>
              <button
                onClick={() => dispatch(fetchEmails())}
                className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Refresh
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto border-t border-gray-200 pt-3">
              {emailStatus === "loading" ? (
                <p className="text-gray-500 text-center">Loading emails...</p>
              ) : emails.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No emails fetched yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {emails.length > 0 && 
                  <>
                  {emails.map((email, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-100 transition"
                    >
                      {email.email}
                    </li>
                  ))}
                  </>
                  }
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:col-span-2 flex flex-col items-center gap-6">
  {squareConnected === null ? (
    <p className="text-gray-500">Checking Square connection...</p>
  ) : squareConnected ? (
    <>
      <h2 className="text-xl font-bold text-gray-800">Square Customers</h2>
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id} className="px-4 py-2 bg-gray-50 rounded-lg border">
              {c.given_name} {c.family_name} – {c.email_address}
            </li>
          ))}
        </ul>
      )}
    </>
  ) : (
    <div
      onClick={() => (window.location.href = "http://localhost:3001/square/login")}
      className="cursor-pointer flex flex-col items-center justify-center rounded-full hover:scale-110 transition-transform"
      title="Connect Square Account"
    >
      <PiSquareLogoFill size={40} className="text-black" />
      <span className="mt-2 text-gray-700 text-sm font-medium text-center">
        Connect Square
      </span>
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
}
