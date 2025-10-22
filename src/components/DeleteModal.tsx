import type { FC } from "react";

interface Item {
  fileUrl: string;
  item: string;
  price: number;
  id: string;
}

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  item: Item | undefined;
}

const DeleteModal: FC<DeleteModalProps> = ({ onClose, onConfirm, item }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      {/* Modal */}
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-sm animate-slideDown relative"
        onClick={(e) => e.stopPropagation()} // stop clicks inside modal from closing it
      >
        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{item.item}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DeleteModal;
