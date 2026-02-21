import type { FC } from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../app/store";
import {
  addProduct,
  updateProduct,
  type Item,
} from "../features/products/productSlice";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Item | undefined;
  editIndex?: number;
}

type FieldErrors = Partial<{
  itemName: string;
  category: string;
  price: string;
  quantity: string;
  file: string;
}>;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  editIndex,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: any) => state.auth.token);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    itemToEdit?.fileUrl || null
  );

  const [itemName, setItemName] = useState(itemToEdit?.item || "");
  const [price, setPrice] = useState(itemToEdit?.price.toString() || "");
  const [category, setCategory] = useState(itemToEdit?.category || "");
  const [description, setDescription] = useState(itemToEdit?.description || "");
  const [quantity, setQuantity] = useState(itemToEdit?.quantity || "");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

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

    setFieldErrors({});
    setError("");
    setLoading(false);
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!itemName.trim()) errors.itemName = "Item name is required.";
    if (!category.trim()) errors.category = "Category is required.";

    const parsedPrice = Number(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = "Price must be greater than 0.";
    }

    if (quantity !== "") {
      const parsedQty = Number(quantity);
      if (!Number.isInteger(parsedQty) || parsedQty < 0) {
        errors.quantity = "Quantity must be a whole number ≥ 0.";
      }
    }

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        errors.file = "Only JPG, PNG, or WEBP images allowed.";
      }

      if (file.size > 5 * 1024 * 1024) {
        errors.file = "Image must be under 5MB.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

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
          ? `${apiUrl}/edit_data`
          : `${apiUrl}/add_data`;

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

      const newItem: Item = {
        fileUrl: responseData.item?.fileUrl || previewUrl || "",
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
        const updatedItem = { ...newItem }; // the item returned from backend
        dispatch(updateProduct({ id: updatedItem.id, changes: updatedItem }));
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

  const renderError = (msg?: string) =>
    msg ? <p className="text-red-500 text-sm mt-1">{msg}</p> : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full sm:max-w-md rounded-lg shadow-xl
        max-h-[90vh] overflow-y-auto transform transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="px-4 pt-4">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-xl text-gray-500"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-center mb-4">
            {itemToEdit ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        <div className="px-4 pb-4 space-y-4">
          <label
            htmlFor="productImage"
            className="block border-2 border-dashed p-4 rounded cursor-pointer"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                className="h-40 w-full object-cover rounded"
              />
            ) : (
              <p className="text-center text-gray-500">Tap to upload image</p>
            )}
          </label>

          <input
            id="productImage"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {renderError(fieldErrors.file)}

          <div>
            <label>Category</label>
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setFieldErrors((p) => ({ ...p, category: undefined }));
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="Category"
            />
            {renderError(fieldErrors.category)}
          </div>

          <div>
            <label>Item Name</label>
            <input
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setFieldErrors((p) => ({ ...p, itemName: undefined }));
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="Name"
            />
            {renderError(fieldErrors.itemName)}
          </div>

          <div>
            <label>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Description"
            />
          </div>

          <div>
            <label>Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setFieldErrors((p) => ({ ...p, price: undefined }));
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="0"
            />
            {renderError(fieldErrors.price)}
          </div>

          <div>
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setFieldErrors((p) => ({ ...p, quantity: undefined }));
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="0"
            />
            {renderError(fieldErrors.quantity)}

          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded
            hover:bg-blue-700 disabled:opacity-50"
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
