import { useState } from "react";
import { motion } from "framer-motion";
import { X, PlusCircle } from "lucide-react";
import axios from "axios";

type DrinkModal = {
    setDrinkModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DrinkModal({setDrinkModal}: DrinkModal) {
  const [drinks, setDrinks] = useState<string[]>([]);
  const [newDrink, setNewDrink] = useState("");

  const addDrink = () => {
    if (newDrink.trim() === "") return;
    if (drinks.includes(newDrink.trim())) return; // prevent duplicates
    setDrinks([...drinks, newDrink.trim()]);
    setNewDrink("");
  };

  const onSubmit = async () => {
    await axios.post('http://localhost:3001/add_drinks', {"drinks": drinks})
    setDrinkModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-xl p-6 w-80 max-w-sm text-center"
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => setDrinkModal(false)}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create Your Drinks
        </h2>

        {/* Input for adding new drink */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newDrink}
            onChange={(e) => setNewDrink(e.target.value)}
            placeholder="Enter drink name..."
            className="flex-1 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={addDrink}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
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
                key={index}
                className="py-2 px-4 border rounded-lg text-gray-800 bg-gray-50 shadow-sm"
              >
                {drink}
              </div>
            ))}
          </div>
        )}

        {/* Confirm button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg shadow-md transition-colors"
          onClick={onSubmit}
        >
          Confirm
        </motion.button>
      </motion.div>
    </div>
  );
}
