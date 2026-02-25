// Offers.tsx
import Sidebar from "../components/Sidebar";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmails } from "../features/emails/emailsSlice";
import { fetchOffers, saveOffers } from "../features/offers/offerSlice";
import type { RootState, AppDispatch } from "../app/store";
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
import { Loader2 } from "lucide-react";
import { TutorialBubble } from "../components/TutorialBubble"; // make sure to import
import { changeTutorialStatusAsync } from "../features/products/productSlice";
export type DealType = Record<string, { name: string; future: string | null; show: number }>;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const backgroundGradient = {
  backgroundImage:
    "linear-gradient(90deg, rgba(184,154,122,0) 0%, rgba(184,154,122,0) 100%), " +
    "linear-gradient(134.583deg, rgba(214,242,244,0) 48.915%, rgb(167,216,255) 93.019%), " +
    "linear-gradient(137.884deg, rgba(222,242,243,1) 0%, rgb(214,242,244) 50.018%)",
};

export default function Offers() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasFetchedInitialData = useRef(false);
  // --- Local State ---
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drinkModal, setDrinkModal] = useState(false);
  const selectedDeals = useSelector(
    (state: RootState) => state.offers.selectedDeals.deals
  );
  // --- Redux State ---
  const emails = useSelector((state: RootState) => state.emails.emails);
  const offerId = useSelector((state: RootState) => state.offers.selectedDeals.id);
  const offerStatus = useSelector((state: RootState) => state.offers.status);
  const [drinks, setDrinks] = useState<string[]>([]);
  const status = useSelector((state: RootState) => state.offers.status);
  const tutorial = useSelector((state: RootState) => state.products.tutorial)
  const [tutorialStep, setTutorialStep] = useState(0); // ✅ add tutorial step
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
        if (!hasFetchedInitialData.current) {

          hasFetchedInitialData.current = true; // Mark as done
        }
        if (!Object.keys(selectedDeals).length) dispatch(fetchOffers());
      } else {
        dispatch(clearAuth());
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate, selectedDeals, emails]);


  useEffect(() => {
    const getDrinks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not authenticated");

        const token = await user.getIdToken();
        const response = await axios.get(`${apiUrl}/get_drinks`, { headers: { 'Authorization': `Bearer ${token}` } })
        console.log(response.data.data[0].drinks)
        setDrinks(response.data.data[0].drinks)
      } catch (err) {
        console.error("Failed to fetch drinks:", err);
      }
    }
    getDrinks()
  }, []);


  console.log(status)
  if (status == 'loading') {
    return (
      <div
        className="h-screen w-full flex bg-[#b8f2f1] overflow-y-auto pb-10"
        style={backgroundGradient}
      >
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex flex-1 justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    )

  }

  return (
    <div
      className="h-screen w-full flex bg-[#b8f2f1] overflow-y-auto pb-10"
      style={backgroundGradient}
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
        <TutorialBubble
          show={tutorialStep === 0 && tutorial.offers === true} // start tutorial at step 0
          text="Here you can toggle between what deals you want to provide your customers. The selected deals are the deals customers will see."
          position="bottom"
          onNext={() => setTutorialStep(1)} // advance tutorial
          condition
        >
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
        </TutorialBubble>

        <TutorialBubble
          show={tutorialStep === 1 && tutorial.offers === true} // start tutorial at step 0
          text="Here you can review your email offers and manage which deals to send to your customers."
          position="top"
          onNext={() => setTutorialStep(2)} // advance tutorial
          onDone={() => { dispatch(changeTutorialStatusAsync('offers')); setTutorialStep(1); }}
          condition
        >
          <EmailOffer />
        </TutorialBubble>
      </div>
    </div>
  );
}
