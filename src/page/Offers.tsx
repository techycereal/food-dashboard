// Offers.tsx
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmails } from "../features/emails/emailsSlice";
import { fetchOffers, saveOffers } from "../features/offers/offerSlice";
import type { RootState, AppDispatch } from "../app/store";
import { PiSquareLogoFill } from "react-icons/pi";
import { Menu } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { clearAuth, setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import DrinkModal from "../components/DrinkModal";
import AvailableDeals from "../components/AvailableDeals";
import SelectedDeals from "../components/SelectedDeals";
import EmailOffer from "../components/EmailOffer";
import axios from "axios";
export type DealType = Record<string, { name: string; future: string | null; show: number }>;

export default function Offers() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // --- Local State ---
  const [mobileOpen, setMobileOpen] = useState(false);
  const [squareConnected, setSquareConnected] = useState<boolean | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drinkModal, setDrinkModal] = useState(false);
  const selectedDeals = useSelector(
    (state: RootState) => state.offers.selectedDeals.deals
  );
  console.log(selectedDeals)
  // --- Redux State ---
  const emails = useSelector((state: RootState) => state.emails.emails);
  const emailStatus = useSelector((state: RootState) => state.emails.status);
  const offers = useSelector((state: RootState) => state.offers.selectedDeals.deals);
  const offerId = useSelector((state: RootState) => state.offers.selectedDeals.id);
  const offerStatus = useSelector((state: RootState) => state.offers.status);
  const { user } = useSelector((state: RootState) => state.auth);
  const [drinks, setDrinks] = useState<string[]>([]);
  // --- Sample Deals ---
  const deals: DealType = {
    "Free drink with any meal": { name: "Free drink with any meal", future: null, show: 1 },
    "10% off your next purchase": { name: "10% off your next purchase", future: "10% off", show: 1 },
  };

  // --- Firebase Auth Listener ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

        // Only fetch if empty
        if (!emails.length) dispatch(fetchEmails());
        if (!Object.keys(offers).length) dispatch(fetchOffers());
      } else {
        dispatch(clearAuth());
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  // --- Fetch Square Customers ---
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:3001/square/customers", { credentials: "include" });
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

  useEffect(() => {
    const getDrinks = async () => {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const response = await axios.get('http://localhost:3001/get_drinks', { headers: { 'Authorization': `Bearer ${token}` } })
      console.log(response.data.data[0].drinks)
      setDrinks(response.data.data[0].drinks)
    }
    getDrinks()
  }, []);

  // --- Loading State ---
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#b8f2f1]">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex bg-[#b8f2f1] overflow-y-auto pb-10"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(184,154,122,0) 0%, rgba(184,154,122,0) 100%), " +
          "linear-gradient(134.583deg, rgba(214,242,244,0) 48.915%, rgb(167,216,255) 93.019%), " +
          "linear-gradient(137.884deg, rgba(222,242,243,1) 0%, rgb(214,242,244) 50.018%)",
      }}
    >
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Menu Button */}
      {!mobileOpen && (
        <div className="absolute top-4 left-4 md:hidden z-40">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded bg-white shadow-md"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Drink Modal */}
      {drinkModal && <DrinkModal setDrinkModal={setDrinkModal} drinks={drinks} setDrinks={setDrinks} />}

      <div className="flex-1 px-6 py-8 max-w-6xl mx-auto space-y-8">
        {/* Deals Section */}
        <AvailableDeals deals={deals} />
        <SelectedDeals setDrinkModal={setDrinkModal} />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => dispatch(saveOffers({ selectedDeals, id: offerId }))}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
          >
            {offerStatus === "loading" ? "Saving..." : "Save Offers"}
          </button>
        </div>

        <EmailOffer />


        {/* Square Customers Section */}
        <section className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Square Customers</h2>
          {squareConnected === null ? (
            <p className="text-gray-500">Checking Square connection...</p>
          ) : squareConnected ? (
            customers.length === 0 ? (
              <p className="text-gray-500">No customers found.</p>
            ) : (
              <ul className="space-y-2">
                {customers.map((c) => (
                  <li key={c.id} className="px-4 py-2 bg-gray-50 rounded-lg border">
                    {c.given_name} {c.family_name} – {c.email_address}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div
              onClick={() => (window.location.href = "http://localhost:3001/square/login")}
              className="cursor-pointer flex flex-col items-center justify-center rounded-full hover:scale-105 transition-transform p-6 border border-gray-200"
              title="Connect Square Account"
            >
              <PiSquareLogoFill size={40} className="text-black" />
              <span className="mt-2 text-gray-700 text-sm font-medium text-center">
                Connect Square
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
