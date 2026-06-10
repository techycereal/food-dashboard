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

interface ModifierItem {
  id: string;
  name: string;
  price: number;
}

type TabKey = "size" | "toppings" | "extras" | "free_sides" | "paid_sides";

interface CustomizationRule {
  min_selectable: number;
  max_selectable: number;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  editIndex,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: any) => state.auth.token);

  // Structural Navigation Wizard State
  const [step, setStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<TabKey>("size");

  // Core Product Input Parameters States
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(itemToEdit?.fileUrl || null);
  const [itemName, setItemName] = useState(itemToEdit?.item || "");
  const [price, setPrice] = useState(itemToEdit?.price.toString() || "");
  const [category, setCategory] = useState(itemToEdit?.category || "");
  const [description, setDescription] = useState(itemToEdit?.description || "");
  const [quantity, setQuantity] = useState(itemToEdit?.quantity || "");
  // Tracking state for inline modifier updates
  const [editingModId, setEditingModId] = useState<string | null>(null);
  const [editModName, setEditModName] = useState("");
  const [editModPrice, setEditModPrice] = useState("");
  // Master Global Library Document State Array Tracker
  const [globalLibrary, setGlobalLibrary] = useState<Record<TabKey, ModifierItem[]>>({
    size: [], toppings: [], extras: [], free_sides: [], paid_sides: []
  });

  // Selected modifier IDs checked off specifically for THIS menu product item document
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Default system rules template map
  const defaultSystemRules: Record<TabKey, CustomizationRule> = {
    size: { min_selectable: 1, max_selectable: 1 },
    toppings: { min_selectable: 0, max_selectable: 99 },
    extras: { min_selectable: 0, max_selectable: 99 },
    free_sides: { min_selectable: 0, max_selectable: 99 },
    paid_sides: { min_selectable: 0, max_selectable: 99 },
  };

  // State tracking custom min/max bounds configurations
  const [customizationRules, setCustomizationRules] = useState<Record<TabKey, CustomizationRule>>(defaultSystemRules);

  // Inline Custom Addition Entry Inputs States
  const [inlineName, setInlineName] = useState("");
  const [inlinePrice, setInlinePrice] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // =========================================================================
  // 🔄 HANDLER: UPDATE AN EXISTING MODIFIER INLINE
  // =========================================================================
  const handleUpdateModifier = async (modId: string) => {
    if (!editModName.trim()) return;

    const calculatedPrice = activeTab !== "free_sides" ? (Number(editModPrice) || 0) : 0;

    // Map across the active collection to update the targeted item properties
    const updatedCategoryList = globalLibrary[activeTab].map((mod) =>
      mod.id === modId
        ? { ...mod, name: editModName.trim(), price: calculatedPrice }
        : mod
    );

    const updatedLibrary = {
      ...globalLibrary,
      [activeTab]: updatedCategoryList
    };

    // Optimistically update frontend state layout panels
    setGlobalLibrary(updatedLibrary);
    setEditingModId(null);

    try {
      await fetch(`${apiUrl}/save_customizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth}`
        },
        body: JSON.stringify({
          modifiers: updatedLibrary,
          customizationRules: customizationRules
        })
      });
      console.log("🚀 Modifier item modification successfully synced to database master document.");
    } catch (err) {
      console.error("Failed to sync updated modifier item adjustments:", err);
    }
  };

  // =========================================================================
  // 🗑️ HANDLER: REMOVE A MODIFIER PERMANENTLY
  // =========================================================================
  const handleDeleteModifier = async (e: React.MouseEvent, modId: string) => {
    e.stopPropagation(); // 🌟 Crucial: Stops the row wrapper click from toggling selection status!

    if (!window.confirm("Are you sure you want to delete this customization option permanently?")) return;

    // Filter out the selected item from the array collection
    const updatedCategoryList = globalLibrary[activeTab].filter((mod) => mod.id !== modId);

    const updatedLibrary = {
      ...globalLibrary,
      [activeTab]: updatedCategoryList
    };

    // Clean the item out of your active chosen product items list if it was checked
    setSelectedGroups((prev) => prev.filter((id) => id !== modId));
    setGlobalLibrary(updatedLibrary);

    try {
      await fetch(`${apiUrl}/save_customizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth}`
        },
        body: JSON.stringify({
          modifiers: updatedLibrary,
          customizationRules: customizationRules
        })
      });
      console.log("🗑️ Customization successfully scrubbed from master configuration file.");
    } catch (err) {
      console.error("Failed to sync deletion adjustments down to backend:", err);
    }
  };

  // FETCH GLOBAL MODIFIERS AND RETAIN/REMEMBER SELECTION RULES
  useEffect(() => {
    const fetchGlobalLibrary = async () => {
      if (!isOpen || step !== 2) return;
      try {
        const response = await fetch(`${apiUrl}/get_customizations`, {
          headers: { Authorization: `Bearer ${auth}` }
        });
        if (response.ok) {
          const data = await response.json();

          // Populate the master available modifier items list
          setGlobalLibrary({
            size: data.modifiers?.size || data.size || [],
            toppings: data.modifiers?.toppings || data.toppings || [],
            extras: data.modifiers?.extras || data.extras || [],
            free_sides: data.modifiers?.free_sides || data.free_sides || [],
            paid_sides: data.modifiers?.paid_sides || data.paid_sides || []
          });

          // Remember rules: If editing a single item, keep product rules. If creating a new item, remember global rules!
          if (!itemToEdit && data.customizationRules) {
            setCustomizationRules({
              size: data.customizationRules.size || defaultSystemRules.size,
              toppings: data.customizationRules.toppings || defaultSystemRules.toppings,
              extras: data.customizationRules.extras || defaultSystemRules.extras,
              free_sides: data.customizationRules.free_sides || defaultSystemRules.free_sides,
              paid_sides: data.customizationRules.paid_sides || defaultSystemRules.paid_sides,
            });
          }
        }
      } catch (err) {
        console.error("❌ Problem extracting custom library configuration context: ", err);
      }
    };
    fetchGlobalLibrary();
  }, [step, isOpen, auth, itemToEdit]);

  // Synchronize modal state fields accurately whenever the input item updates
  useEffect(() => {
    if (itemToEdit) {
      setFile(null);
      setPreviewUrl(itemToEdit.fileUrl);
      setItemName(itemToEdit.item);
      setDescription(itemToEdit.description || "");
      setPrice(itemToEdit.price.toString());
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity || "");
      setCustomizationRules((itemToEdit as any).customizationRules || defaultSystemRules);

      // 🌟 FIX: Pull IDs from the 'customizations' object array if 'linkedModifierIds' is missing
      const rawLinkedIds = (itemToEdit as any).linkedModifierIds;
      const enrichedCustomizations = (itemToEdit as any).customizations || [];

      if (rawLinkedIds && rawLinkedIds.length > 0) {
        setSelectedGroups(rawLinkedIds);
      } else if (enrichedCustomizations.length > 0) {
        // Extract the string IDs out of the resolved objects array [{id: "extras_1", name: "Bacon"}]
        const extractedIds = enrichedCustomizations.map((mod: any) => mod.id);
        setSelectedGroups(extractedIds);
      } else {
        setSelectedGroups([]);
      }

    } else {
      // Reset values for creating a brand new item
      setFile(null);
      setPreviewUrl(null);
      setItemName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setQuantity("");
      setSelectedGroups([]);
      setCustomizationRules(defaultSystemRules);
    }

    setStep(1);
    setActiveTab("size");
    setInlineName("");
    setInlinePrice("");
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

  const toggleGroupSelection = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRuleChange = (key: 'min_selectable' | 'max_selectable', val: number) => {
    setCustomizationRules(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: Math.max(0, val)
      }
    }));
  };

  const handleCreateInlineOption = async () => {
    if (!inlineName.trim()) return;

    const calculatedPrice = activeTab !== "free_sides" ? (Number(inlinePrice) || 0) : 0;
    const newOption: ModifierItem = {
      id: `${activeTab}_${crypto.randomUUID()}`,
      name: inlineName.trim(),
      price: calculatedPrice
    };

    const updatedLibrary = {
      ...globalLibrary,
      [activeTab]: [...globalLibrary[activeTab], newOption]
    };
    setGlobalLibrary(updatedLibrary);
    toggleGroupSelection(newOption.id);

    setInlineName("");
    setInlinePrice("");

    try {
      await fetch(`${apiUrl}/save_customizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth}`
        },
        body: JSON.stringify({
          modifiers: updatedLibrary,
          customizationRules: customizationRules
        })
      });
      console.log("🚀 Custom library synchronized mid-creation stream cleanly.");
    } catch (err) {
      console.error("Non-fatal mid-stream library update fallback error:", err);
    }
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
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("item", itemName);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("type", "product");

      formData.append("linkedModifierIds", JSON.stringify(selectedGroups));
      formData.append("allCurrentModifiers", JSON.stringify(globalLibrary));
      formData.append("customizationRules", JSON.stringify(customizationRules));

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
        id: itemToEdit?.id || responseData.item?.id || crypto.randomUUID(),
        category,
        quantity,
        description,
        linkedModifierIds: selectedGroups,
        customizationRules: customizationRules
      } as any;

      if (editIndex !== undefined) {
        dispatch(updateProduct({ id: newItem.id, changes: newItem }));
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
        <div className="px-4 pt-4 border-b pb-2 flex justify-between items-center">
          <div className="flex space-x-1">
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${step === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>1. Details</span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${step === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>2. Customize</span>
          </div>
          <button onClick={handleClose} className="text-xl text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <h2 className="text-xl font-bold text-center mt-3 px-4">
          {step === 1
            ? (itemToEdit ? "Edit Product" : "Add New Product")
            : "Link Customization Options"}
        </h2>

        <div className="px-4 pb-4 pt-2 space-y-4">
          {step === 1 ? (
            /* ================= STEP 1 SCREEN ================= */
            <>
              <label
                htmlFor="productImage"
                className="block border-2 border-dashed p-4 rounded cursor-pointer"
              >
                {previewUrl ? (
                  <img src={previewUrl} className="h-40 w-full object-cover rounded" alt="Preview" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setFieldErrors((p) => ({ ...p, category: undefined }));
                  }}
                  className="w-full border rounded px-3 py-2 outline-none"
                  placeholder="Category"
                />
                {renderError(fieldErrors.category)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                    setFieldErrors((p) => ({ ...p, itemName: undefined }));
                  }}
                  className="w-full border rounded px-3 py-2 outline-none"
                  placeholder="Name"
                />
                {renderError(fieldErrors.itemName)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2 outline-none"
                  placeholder="Description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setFieldErrors((p) => ({ ...p, price: undefined }));
                    }}
                    className="w-full border rounded px-3 py-2 outline-none"
                    placeholder="0"
                  />
                  {renderError(fieldErrors.price)}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setFieldErrors((p) => ({ ...p, quantity: undefined }));
                    }}
                    className="w-full border rounded px-3 py-2 outline-none"
                    placeholder="0"
                  />
                  {renderError(fieldErrors.quantity)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => validate() && setStep(2)}
                className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors"
              >
                Next: Customizations →
              </button>
            </>
          ) : (
            /* ================= STEP 2 SCREEN ================= */
            <>
              <div className="flex space-x-1 border-b overflow-x-auto pb-1">
                {(["size", "toppings", "extras", "free_sides", "paid_sides"] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => { setActiveTab(tabKey); setInlineName(""); setInlinePrice(""); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-t-md capitalize whitespace-nowrap transition-colors ${activeTab === tabKey ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {tabKey.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* BOUNDARY RULE LIMIT CONTROLS */}
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">
                    Min Selectable:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customizationRules[activeTab]?.min_selectable ?? 0}
                    onChange={(e) => handleRuleChange('min_selectable', parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-blue-200 rounded px-2 py-1 outline-none font-medium text-gray-700 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">0 = Optional, 1+ = Required</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">
                    Max Selectable:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customizationRules[activeTab]?.max_selectable ?? 1}
                    onChange={(e) => handleRuleChange('max_selectable', parseInt(e.target.value) || 1)}
                    className="w-full text-sm bg-white border border-blue-200 rounded px-2 py-1 outline-none font-medium text-gray-700 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">1 = Single, 2+ = Multi-select</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[25vh] overflow-y-auto border p-2 bg-gray-50 rounded-lg">
                {globalLibrary[activeTab].length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">
                    No active options found in this collection. Add one below!
                  </p>
                ) : (
                  globalLibrary[activeTab].length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-6">
                      No active options found in this collection. Add one below!
                    </p>
                  ) : (
                    globalLibrary[activeTab].map((mod) => {
                      const isChecked = selectedGroups.includes(mod.id);
                      const isEditingThis = editingModId === mod.id;

                      if (isEditingThis) {
                        // 📝 EDIT MODE INLINE FORM SUB-VIEW ROW ROW LAYOUT
                        return (
                          <div key={mod.id} className="flex gap-2 p-2 bg-blue-50 border border-blue-300 rounded shadow-inner">
                            <input
                              type="text"
                              value={editModName}
                              onChange={(e) => setEditModName(e.target.value)}
                              className="flex-1 text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 text-black"
                              placeholder="Option Name"
                            />
                            {activeTab !== "free_sides" && (
                              <div className="relative w-20">
                                <span className="absolute left-1.5 top-1 text-xs text-gray-400">$</span>
                                <input
                                  type="number"
                                  value={editModPrice}
                                  onChange={(e) => setEditModPrice(e.target.value)}
                                  className="w-full text-xs border rounded pl-4 pr-1 py-1 outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                  placeholder="0.00"
                                />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateModifier(mod.id)}
                              className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingModId(null)}
                              className="bg-gray-400 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        );
                      }

                      // 👁️ STANDARD DISPLAY RENDER ROW (WITH CONTROL BUTTONS)
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleGroupSelection(mod.id)}
                          className={`flex items-center justify-between p-2.5 bg-white rounded border shadow-sm cursor-pointer hover:border-blue-400 transition-colors ${isChecked ? "border-blue-500 bg-blue-50/30" : "border-gray-200"
                            }`}
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => { }} // Driven by parent row wrapper click
                              className="rounded text-blue-600 focus:ring-blue-400 h-4 w-4 flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-700 truncate">{mod.name}</span>
                          </div>

                          <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                            {activeTab !== "free_sides" && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                                {mod.price > 0 ? `+$${mod.price.toFixed(2)}` : "Free"}
                              </span>
                            )}

                            {/* 🛠️ EDIT ICON BUTTON TRIGGER */}
                            <button
                              type="button"
                              title="Edit Option"
                              onClick={(e) => {
                                e.stopPropagation(); // Stops checking/unchecking the option item row
                                setEditingModId(mod.id);
                                setEditModName(mod.name);
                                setEditModPrice(mod.price.toString());
                              }}
                              className="text-gray-400 hover:text-blue-600 transition-colors text-sm font-semibold px-1"
                            >
                              ✏️
                            </button>

                            {/* 🗑️ DELETE ICON BUTTON TRIGGER */}
                            <button
                              type="button"
                              title="Delete Option"
                              onClick={(e) => handleDeleteModifier(e, mod.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors text-sm font-semibold px-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs font-bold text-gray-700 mb-1">✨ Create a missing option instantly:</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Honey Mustard, Double Patty"
                    value={inlineName}
                    onChange={(e) => setInlineName(e.target.value)}
                    className="flex-1 text-sm border rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {activeTab !== "free_sides" && (
                    <div className="relative w-24">
                      <span className="absolute left-2.5 top-1.5 text-sm text-gray-400">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={inlinePrice}
                        onChange={(e) => setInlinePrice(e.target.value)}
                        className="w-full text-sm border rounded pl-5 pr-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateInlineOption}
                    className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-900 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded font-semibold hover:bg-gray-200 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-2/3 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? "Processing..."
                    : itemToEdit
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;