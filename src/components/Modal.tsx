import type { FC } from "react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { addProduct, updateProduct, type Item as ReduxItem } from "../features/products/productSlice";
import { useSelector } from "react-redux";
type Item = {
  fileUrl: string;
  item: string;
  price: number;
  id: string;
  category: string;
  quantity: string;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  itemToEdit?: Item; // optional for editing
  editIndex?: number; // index of the item being edited
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, setItems, itemToEdit, editIndex }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(itemToEdit?.fileUrl || null);
  const [itemName, setItemName] = useState(itemToEdit?.item || "");
  const [price, setPrice] = useState(itemToEdit?.price.toString() || "");
  const [category, setCategory] = useState(itemToEdit?.category.toString() || "");
  console.log(itemToEdit)
  const [quantity, setQuantity] = useState(itemToEdit?.quantity.toString() || "")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(state => state.auth.token)
  console.log(auth)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (itemToEdit) {
      setFile(null);
      setPreviewUrl(itemToEdit.fileUrl);
      setItemName(itemToEdit.item);
      setPrice(itemToEdit.price.toString());
    } else {
      setFile(null);
      setPreviewUrl(null);
      setItemName("");
      setPrice("");
    }
    setError("");
    setLoading(false);
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url); // temporary preview
    }
  };

  
const handleSubmit = async () => {
  if (!itemName || !price || !category) {
    setError("Please provide item name, price and category.");
    return;
  }

  if (editIndex === undefined && !file) {
    setError("Please provide an image for the new product.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    let fileUrl = previewUrl || "";

    const formData = new FormData();
    formData.append("item", itemName);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("type", 'product');

    if (file) formData.append("file", file);
    if (!file && itemToEdit?.fileUrl) formData.append("fileUrl", itemToEdit.fileUrl);
    if (itemToEdit?.id) formData.append("id", itemToEdit.id);
    if (quantity !== '') formData.append("quantity", quantity);

    const endpoint = editIndex !== undefined ? "http://localhost:3001/edit_data" : "http://localhost:3001/add_data";
    const method = editIndex !== undefined ? "PUT" : "POST";

    const response = await fetch(endpoint, {
  method,
  body: formData,
  headers: {
    Authorization: `Bearer ${auth}`,
  },
});
    if (!response.ok) throw new Error("Upload failed");
    const responseData = await response.json();

    fileUrl = responseData.item.fileUrl || previewUrl || "";
    const id = itemToEdit?.id || responseData.item.id || crypto.randomUUID();
    const newItem: ReduxItem = { fileUrl, item: itemName, price: Number(price), id, category, quantity };

    // update Redux
    if (editIndex !== undefined) {
      dispatch(updateProduct({ index: editIndex, item: newItem }));
    } else {
      dispatch(addProduct(newItem));
    }

    onClose();
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
  <div
    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-slideDown relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        {itemToEdit ? "Edit Product" : "Add New Product"}
      </h2>

      <div className="flex flex-col gap-4">
        {/* Image Upload */}
        <label
          htmlFor="productImage"
          className="flex flex-col items-center border-2 border-dashed border-gray-300 p-4 rounded cursor-pointer hover:border-gray-500 w-full"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded"
            />
          ) : (
            "Click to upload an image"
          )}
        </label>
        <input
          id="productImage"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Item Name */}
        <label htmlFor="itemName" className="text-gray-700 font-medium">
          Item Name
        </label>
        <input
          id="itemName"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Item Name"
        />

        {/* Category */}
        <label htmlFor="category" className="text-gray-700 font-medium">
          Category
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Category"
        />

        {/* Price */}
        <label htmlFor="price" className="text-gray-700 font-medium">
          Price ($)
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Price ($)"
        />

        <label htmlFor="Quantity" className="text-gray-700 font-medium">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Quantity"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : itemToEdit
            ? "Update Product"
            : "Add Product"}
        </button>
      </div>
    </div>
  </div>

  <style>{`
    @keyframes slideDown {
      0% { transform: translateY(-50px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
  `}</style>
</>

  );
};

export default Modal;
