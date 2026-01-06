import type { FC } from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../app/store";
import {
  addProduct,
  updateProduct,
  type Item as ReduxItem,
} from "../features/products/productSlice";

type Item = {
  fileUrl: string;
  item: string;
  price: number;
  id: string;
  category: string;
  quantity: string;
  description: string;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Item;
  editIndex?: number;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  editIndex,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    itemToEdit?.fileUrl || null
  );
  const [itemName, setItemName] = useState(itemToEdit?.item || "");
  const [price, setPrice] = useState(itemToEdit?.price.toString() || "");
  const [category, setCategory] = useState(itemToEdit?.category || "");
  const [description, setDescription] = useState(
    itemToEdit?.description || ""
  );
  const [quantity, setQuantity] = useState(
    itemToEdit?.quantity || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    if (itemToEdit) {
      setFile(null);
      setPreviewUrl(itemToEdit.fileUrl);
      setItemName(itemToEdit.item);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price.toString());
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity);
    } else {
      setFile(null);
      setPreviewUrl(null);
      setItemName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setQuantity("");
    }
    setError("");
    setLoading(false);
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
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
      const formData = new FormData();
      formData.append("item", itemName);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("type", "product");

      if (file) formData.append("file", file);
      if (!file && itemToEdit?.fileUrl)
        formData.append("fileUrl", itemToEdit.fileUrl);
      if (itemToEdit?.id) formData.append("id", itemToEdit.id);
      if (quantity !== "") formData.append("quantity", quantity);

      const endpoint =
        editIndex !== undefined
          ? "http://localhost:3001/edit_data"
          : "http://localhost:3001/add_data";

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

      const newItem: ReduxItem = {
        fileUrl:
          responseData.item?.fileUrl || previewUrl || "",
        item: itemName,
        price: Number(price),
        id:
          itemToEdit?.id ||
          responseData.item?.id ||
          crypto.randomUUID(),
        category,
        quantity,
        description,
      };

      if (editIndex !== undefined) {
        dispatch(updateProduct({ index: editIndex, item: newItem }));
      } else {
        dispatch(addProduct(newItem));
      }

      handleClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4"
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full sm:max-w-md rounded-lg shadow-xl
        max-h-[90vh] overflow-y-auto
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-4 pt-4">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-xl text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>

          <h2 className="text-lg sm:text-xl font-bold text-center mb-4">
            {itemToEdit ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* Image Upload */}
          <label
            htmlFor="productImage"
            className="flex flex-col items-center justify-center border-2 border-dashed
            border-gray-300 p-4 rounded cursor-pointer hover:border-gray-500"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-32 sm:h-40 object-cover rounded"
              />
            ) : (
              <span className="text-sm text-gray-500 text-center">
                Tap to upload an image
              </span>
            )}
          </label>

          <input
            id="productImage"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Inputs */}
          {[
            ["Category", category, setCategory],
            ["Item Name", itemName, setItemName],
            ["Description", description, setDescription],
          ].map(([label, value, setter]: any) => (
            <div key={label}>
              <label className="font-medium text-gray-700">
                {label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full border rounded px-4 py-3 text-base
                focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div>
            <label className="font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded px-4 py-3 text-base
              focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded px-4 py-3 text-base
              focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white py-3 rounded text-base
            hover:bg-blue-600 disabled:opacity-50"
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
  );
};

export default Modal;
