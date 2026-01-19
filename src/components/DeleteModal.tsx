import type { FC } from "react";
import { useState, useEffect } from "react";
import type { Item } from "../features/products/productSlice";

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  item: Item | undefined;
}

const DeleteModal: FC<DeleteModalProps> = ({ onClose, onConfirm, item }) => {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10); // small delay to trigger transition
    return () => clearTimeout(timer);
  }, []);
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      {/* Modal */}
      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-sm transform transition-all duration-300 ease-out
    ${isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-20 opacity-0"}`}
        onClick={(e) => e.stopPropagation()} // stop clicks inside modal from closing it
      >
        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{item.item}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

    </div>
  );
};

export default DeleteModal;
