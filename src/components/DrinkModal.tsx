import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, PlusCircle } from "lucide-react";
import axios from "axios";
import { auth } from "../lib/firebase";

type DrinkModalProps = {
  setDrinkModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDrinks: React.Dispatch<React.SetStateAction<string[]>>;
  drinks: string[];
};

const MAX_DRINK_LENGTH = 40;

const normalizeDrink = (value: string) =>
  value.trim().slice(0, MAX_DRINK_LENGTH);

export default function DrinkModal({
  setDrinkModal,
  drinks,
  setDrinks,
}: DrinkModalProps) {
  const [newDrink, setNewDrink] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setDrinkModal(false), 300);
  };

  const isDuplicate = (value: string) =>
    drinks.some((d) => d.toLowerCase() === value.toLowerCase());

  const addDrink = () => {
    const normalized = normalizeDrink(newDrink);
    if (!normalized) return;
    if (isDuplicate(normalized)) return;

    setDrinks([...drinks, normalized]);
    setNewDrink("");
  };

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    handleClose();

    const pendingDrink = normalizeDrink(newDrink);

    const allDrinks =
      pendingDrink && !isDuplicate(pendingDrink)
        ? [...drinks, pendingDrink]
        : drinks;

    if (allDrinks.length === 0) {
      setSubmitting(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

      await axios.post(
        "http://localhost:3001/add_drinks",
        { drinks: allDrinks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDrinks(allDrinks);
      setNewDrink("");
    } catch (err) {
      console.error("Failed to save drinks:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const removeDrink = (drinkToRemove: string) => {
    setDrinks(drinks.filter((d) => d !== drinkToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative bg-white rounded-2xl shadow-xl p-6 w-80 max-w-sm text-center
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}
      >
        {/* Close */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create Your Drinks
        </h2>

        {/* Input */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newDrink}
            maxLength={MAX_DRINK_LENGTH}
            onChange={(e) => setNewDrink(e.target.value)}
            placeholder="Enter drink name..."
            className="flex-1 border rounded-lg px-3 py-2 text-gray-700
            focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={addDrink}
            className="p-2 bg-green-500 hover:bg-green-600
            text-white rounded-lg transition-colors"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {/* Drink list */}
        {drinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No drinks added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {drinks.map((drink, index) => (
              <div
                key={`${drink}-${index}`}
                className="flex items-center justify-between
    py-2 px-4 border rounded-lg
    text-gray-800 bg-gray-50 shadow-sm"
              >
                <span className="truncate">{drink}</span>

                <button
                  onClick={() => removeDrink(drink)}
                  className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${drink}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Confirm */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={
            submitting ||
            (drinks.length === 0 && normalizeDrink(newDrink) === "")
          }
          onClick={onSubmit}
          className="mt-5 w-full bg-green-500 hover:bg-green-600
          text-white font-semibold py-2 rounded-lg shadow-md
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Confirm"}
        </motion.button>
      </div>
    </div>
  );
}
