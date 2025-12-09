import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { type Item } from "../features/products/productSlice";
import confetti from "canvas-confetti";
import WifiProvisioner from "./WifiProvision";

interface WindowProps {
  handleEdit: (item: Item, index: number) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<Item | undefined>>;
}

export default function Window({ handleEdit, setSelectedItem }: WindowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.products.items);
  const status = useSelector((state: RootState) => state.products.status);
  const auth = useSelector((state: RootState) => state.auth.token);
  console.log(auth)

  const [pageSize, setPageSize] = useState(4);
  const [page, setPage] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);

  const loading = status === "loading";

  // ✅ Category state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth >= 1024) setPageSize(4);
      else if (window.innerWidth >= 768) setPageSize(3);
      else setPageSize(1000);
      setPage(0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemClicked = (item: Item, index: number) => {
    handleEdit(item, index);
  };

  // ✅ Step 1: Filter first
  const categoryFiltered =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  // ✅ Step 2: Total pages based on filtered set
  const totalPages = Math.ceil(categoryFiltered.length / pageSize);

  // ✅ Step 3: Clamp page if it’s out of range
  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  // ✅ Step 4: Paginate after filtering
  const paginatedItems = isSmallScreen
    ? categoryFiltered
    : categoryFiltered.slice(page * pageSize, (page + 1) * pageSize);

  // Sync to backend
  const natsPush = async () => {
    try {
      setSyncing(true);
      setSuccess(false);

      await axios.put("http://localhost:3001/natspush",{}, {
  headers: { Authorization: `Bearer ${auth}` },
});

      // SUCCESS ANIMATION
      setSuccess(true);
      confetti({
        particleCount: 400,
        spread: 400,
        origin: { y: 0.5 },
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Push failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center relative w-full 
        max-w-[1400px] md:max-w-[95%] lg:max-w-[90%] 
        min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] 
        max-h-[85vh] ml-0 md:ml-10"
    >
      {/* Category Toggle */}
      <div className="flex gap-3 justify-center flex-wrap p-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(0); // reset pagination when switching categories
            }}
            className={`px-4 py-2 rounded-lg shadow font-bold transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Awning */}
      <div className="relative w-full flex justify-between shadow-lg">
        <div className="bg-[#4c4c4c] h-12 flex-1 shadow-xl rounded-sm" />
      </div>

      {/* Window */}
      <section className="bg-white w-full rounded-sm shadow-xl flex flex-col flex-1 max-h-[75vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-1 justify-center items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <div
            className={`flex-1 w-full p-6 gap-6 sm:gap-8 md:gap-10 grid
              ${
                isSmallScreen
                  ? "grid-cols-1"
                  : "grid-cols-[repeat(auto-fit,minmax(320px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(380px,1fr))]"
              }
              justify-items-center items-center
            `}
          >
            {paginatedItems.map((item, index) => (
              <div
  key={index}
  className="relative w-full max-w-[380px] h-96 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
  style={{
    backgroundImage: `url(${item.fileUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
  onClick={() => itemClicked(item, index)}
>
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
    <h3 className="text-white font-bold text-xl">{item.item}</h3>
    <p className="text-blue-400 font-semibold text-lg">${item.price}</p>

    {/* ✅ Quantity display */}
      <p className="text-md text-gray-200">
  {item.quantity === "0"
    ? "Out of Stock"
    : item.quantity === ""
    ? ""
    : `Quantity: ${item.quantity}`}
</p>
  </div>

  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedItem(item);
    }}
    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 shadow-lg font-bold text-lg"
  >
    ✕
  </button>
</div>
            ))}
          </div>
        )}
      </section>

      {/* Submit Button */}
      <button
        onClick={natsPush}
        disabled={loading || syncing}
        className={`absolute bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg font-bold transition 
          ${syncing ? "bg-purple-500 text-white animate-pulse" : ""}
          ${success ? "bg-green-500 text-white" : ""}
          ${!syncing && !success ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
        `}
      >
        {syncing ? "🚀 Launching…" : success ? "✅ Data Synced!" : "Sync Data"}
      </button>
      <WifiProvisioner/>

      {/* Bottom Ledge */}
      <div className="bg-[#4c4c4c] h-5 w-full shadow-xl rounded-sm" />

      {/* Pagination */}
      {!isSmallScreen && !loading && totalPages > 1 && (
        <div className="hidden md:flex items-center justify-center gap-4 py-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="p-2 bg-gray-200 rounded-full disabled:opacity-40"
          >
            <ChevronLeft />
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="p-2 bg-gray-200 rounded-full disabled:opacity-40"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
