import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { type Item } from "../features/products/productSlice";
import confetti from "canvas-confetti";
import { FaTrashCan, FaWifi } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Chalk from '../../public/chalk.png'
import { addName, changeTutorialStatusAsync } from "../features/products/productSlice";
import { TutorialBubble } from "./TutorialBubble";
interface WindowProps {
  handleEdit: (item: Item, index: number) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<Item | undefined>>;
  openModal: () => void;
  openWiFi: () => void;
}

const ITEMS_VISIBLE = 4;

const TUTORIAL_STEPS = [
  "wifi",
  "add-item",
  "edit-item",
  "delete-item",
  "sync-data",
] as const;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
type TutorialStep = (typeof TUTORIAL_STEPS)[number];

export default function Window({ handleEdit, setSelectedItem, openModal, openWiFi }: WindowProps) {
  const items = useSelector((state: RootState) => state.products.items);
  const status = useSelector((state: RootState) => state.products.status);
  const auth = useSelector((state: RootState) => state.auth.token);
  const cachedName = useSelector((state: RootState) => state.products.name)
  const tutorial = useSelector((state: RootState) => state.products.tutorial)
  let showTutorial = tutorial['window'] === true;
  const dispatch = useDispatch<AppDispatch>()
  const loading = status === "loading";
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categoryPage, setCategoryPage] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categoriesPerPage, setCategoriesPerPage] = useState(3);
  const [businessName, setBusinessName] = useState(cachedName.length > 0 ? cachedName : '')
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const currentStep: TutorialStep | null =
    showTutorial ? TUTORIAL_STEPS[tutorialStepIndex] : null;

  const isStep = (step: TutorialStep) => currentStep === step;

  const nextStep = () => {
    setTutorialStepIndex((i) =>
      Math.min(i + 1, TUTORIAL_STEPS.length - 1)
    );
  };

  const prevStep = () => {
    setTutorialStepIndex((i) => Math.max(i - 1, 0));
  };

  const finishTutorial = () => {
    // later: dispatch(updateTutorial({ window: false }))
    dispatch(changeTutorialStatusAsync('window'))
    setTutorialStepIndex(0);
  };

  useEffect(() => {
    const name = async () => {
      const response = await axios.get(`${apiUrl}/get_name`, { headers: { Authorization: `Bearer ${auth}` } })
      setBusinessName(response.data.message)
      dispatch(addName(response.data.message))
    }
    if (cachedName.length < 1) {
      name()
    }
  }, [])
  // Responsive categories per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setCategoriesPerPage(3); // lg
      else if (window.innerWidth >= 768) setCategoriesPerPage(2); // md
      else setCategoriesPerPage(1); // sm
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const hasItems = items.length > 0 ? true : false

  const visibleCategories = categories.slice(
    categoryPage * categoriesPerPage,
    categoryPage * categoriesPerPage + categoriesPerPage
  );

  const itemsByCategory = useMemo(() => {
    return categories.reduce<Record<string, Item[]>>((acc, category) => {
      acc[category] = items.filter(item => item.category === category);
      return acc;
    }, {});
  }, [categories, items]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const itemClicked = (item: Item, index: number) => {
    handleEdit(item, index);
  };

  const natsPush = async () => {
    try {
      setSyncing(true);
      setSuccess(false);
      setShowErrorModal(false); // Reset error state on retry
      await axios.put(`${apiUrl}/natspush`, {}, { headers: { Authorization: `Bearer ${auth}` } });
      setSuccess(true);
      confetti({ particleCount: 400, spread: 400, origin: { y: 0.5 } });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Push failed:", err);
      setShowErrorModal(true); // Open the error modal
    } finally {
      setSyncing(false);
    }
  };

  const visibleCategoriesMobile = categories; // all categories
  const visibleCategoriesToRender = categoriesPerPage > 1
    ? visibleCategories // desktop: pagination
    : visibleCategoriesMobile; // mobile: all categories

  return (
    <div className="flex flex-col items-center relative w-full max-w-[1000px] md:max-w-[85%] lg:max-w-[75%] min-h-[600px] sm:min-h-[650px] md:min-h-[700px] lg:min-h-[750px] max-h-[95vh] text-white font-sora figma-noise">

      {/* WINDOW */}
      <section
        className="relative w-full flex flex-col flex-1 max-h-[85vh] overflow-hidden border-8 rounded-[2rem] shadow-[10px_10px_7.8px_0px_rgba(0,0,0,0.25)]"
        style={{
          borderColor: "#B89A7A",
          backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%), linear-gradient(99.8543deg, rgba(101, 101, 101, 1) 24.476%, rgb(0,0,0) 100%)",
        }}
      >
        {/* Chalk image as watermark */}
        <img
          src={Chalk}
          alt="chalk texture"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52%] max-w-none opacity-[11%] pointer-events-none select-none z-0"
        />

        {/* Desktop Add Item */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex">
          <TutorialBubble
            show={isStep("add-item")}
            text="Add a new menu item to your board."
            position="bottom-right"
            onBack={prevStep}
            onNext={nextStep}
            condition={items.length > 0}
          >
            <button
              onClick={openModal}
              className="
        px-6 py-3
        flex items-center gap-2
        font-bold text-white
        bg-gradient-to-r from-[#706e6e] to-[#3e3e3e]
        rounded-2xl
        hover:opacity-95 hover:scale-105
        transition-all duration-200
        cursor-pointer
      "
            >
              <FaPlus size={20} />
              <span>Add Item</span>
            </button>
          </TutorialBubble>
        </div>

        <div className="absolute top-4 left-4 z-20">
          <div className="absolute top-4 left-4 z-20">
            <TutorialBubble
              show={isStep("wifi")}
              text="Open Wi-Fi settings or view connection info."
              position="right"
              onNext={nextStep}
              condition
            >
              <button
                onClick={openWiFi}
                className="
        p-2
        flex items-center gap-2
        font-bold text-white
        rounded-full
        hover:opacity-95 hover:scale-105
        transition-all duration-200
        cursor-pointer
        bg-blue-400
      "
              >
                <FaWifi size={20} />
              </button>
            </TutorialBubble>
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 text-center py-20 md:py-18 lg:py-18 xl:py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-chalk-shadow">
            {businessName}
          </h1>
        </div>

        {/* Content */}
        {/* Content */}
        {showErrorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#2d2d2d] border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-red-500">Oops!</h2>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaXmark size={24} />
                </button>
              </div>

              <p className="text-gray-200 mb-6 leading-relaxed">
                It looks like your items couldn't save to your CurbBox. Here's some steps to fix this:
              </p>

              <ul className="space-y-3 text-gray-300 mb-8">
                <li className="flex gap-3 items-start">
                  <span className="flex items-center justify-center bg-red-500/20 text-red-400 rounded-full h-6 w-6 text-sm font-bold shrink-0">1</span>
                  Ensure your CurbSuite Box is connected to the internet
                </li>
                <li className="flex gap-3 items-start">
                  <span className="flex items-center justify-center bg-red-500/20 text-red-400 rounded-full h-6 w-6 text-sm font-bold shrink-0">2</span>
                  Reload your page
                </li>
              </ul>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex flex-1 justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className={`flex flex-col flex-1 relative overflow-hidden md:pb-0`}>
            {hasItems ? (
              <>
                <div
                  className={`
    grid gap-8 p-6 overflow-y-auto flex-1
    ${categoriesPerPage === 1 || visibleCategoriesToRender.length === 1 ? "grid-cols-1 justify-items-center" : ""}
    ${visibleCategoriesToRender.length === 2 ? "md:grid-cols-2" : ""}
    ${visibleCategoriesToRender.length >= 3 ? "lg:grid-cols-3" : ""}
  `}
                >
                  {visibleCategoriesToRender.map((category, idx) => {
                    const categoryItems = itemsByCategory[category] || [];
                    const isExpanded = expandedCategories[category];
                    const visibleItems = isExpanded
                      ? categoryItems
                      : categoryItems.slice(0, ITEMS_VISIBLE);
                    const isFirstCategory = idx === 0;

                    return (
                      <div
                        key={category}
                        className={`
          flex flex-col pr-4 
          ${idx !== visibleCategories.length - 1 ? "md:border-r-2 md:border-white" : ""}
          ${visibleCategoriesToRender.length === 1 ? "w-full max-w-[600px]" : "w-full"} 
          md:max-h-[500px]
        `}
                      >
                        <h2 className="text-3xl font-bold text-start mb-6 text-chalk-shadow flex-shrink-0">{category}</h2>
                        <div className="flex flex-col gap-8 overflow-y-auto flex-1 pr-2 scrollable overflow-x-hidden">
                          {visibleItems.map((item, index) => {
                            const isFirstItem = isFirstCategory && index === 0;
                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center cursor-pointer text-lg"
                              >
                                <div className="flex justify-between items-center gap-8 pb-2 border-b border-white flex-1">
                                  <span className="text-white">{item.item}</span>
                                  <span className="text-white">${item.price}</span>
                                </div>
                                <div className="flex items-center gap-4 pl-4 mb-3">
                                  {isFirstItem && isStep("edit-item") ? (
                                    <TutorialBubble
                                      show
                                      text={
                                        <>
                                          Edit an existing <br /> menu  item
                                        </>
                                      }
                                      position="bottom-right"
                                      onBack={prevStep}
                                      onNext={nextStep}
                                      condition
                                    >
                                      <FaPencilAlt size={20} onClick={() => itemClicked(item, index)} />
                                    </TutorialBubble>
                                  ) : (
                                    <FaPencilAlt size={20} onClick={() => itemClicked(item, index)} />
                                  )}
                                  {isFirstItem && isStep("delete-item") ? (
                                    <TutorialBubble
                                      show
                                      text="Delete an item from your menu."
                                      position="bottom-right"
                                      onBack={prevStep}
                                      onNext={nextStep}
                                      condition
                                    >
                                      <FaTrashCan size={20} onClick={() => setSelectedItem(item)} />
                                    </TutorialBubble>
                                  ) : (
                                    <FaTrashCan size={20} onClick={() => setSelectedItem(item)} />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {categoryItems.length > ITEMS_VISIBLE && (
                          <button
                            onClick={() => toggleCategory(category)}
                            className="mt-3 text-white font-bold hover:underline"
                          >
                            {isExpanded ? "See Less" : "See More"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center">No Items. Click "Add Item" to Create New Items</p>
            )}


            {/* Mobile buttons at bottom of chalkboard */}
            <div className="flex flex-col sm:hidden gap-2 px-6 pb-4">
              <TutorialBubble
                show={isStep("sync-data")}
                text="Push your menu live."
                position="top"
                onBack={prevStep}
                onDone={finishTutorial}
                isLast
                condition
              >
                <button
                  onClick={natsPush}
                  disabled={loading || syncing}
                  className={`w-full px-3 py-2 text-sm rounded-lg font-semibold transition
      ${syncing ? "bg-purple-500 text-white animate-pulse" : ""}
      ${success ? "bg-green-500 text-white" : ""}
      ${!syncing && !success ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
    `}
                >
                  {syncing ? "🚀 Launching…" : success ? "✅ Data Synced!" : "Sync Data"}
                </button>
              </TutorialBubble>
              <TutorialBubble
                show={isStep("add-item")}
                text="Add a New Menu Item To The Board (Required for The Next Step)"
                position="top"
                onBack={prevStep}
                onNext={nextStep}
                condition={items.length > 0}
                isLast
              >
                <button
                  onClick={openModal}
                  className="w-full px-3 py-2 text-sm bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <FaPlus size={14} />
                  Add Item
                </button>
              </TutorialBubble>
            </div>

            {/* Pagination Controls only if categoriesPerPage > 1 */}
            {categoriesPerPage > 1 && totalCategoryPages > 1 && (
              <div className="flex justify-center items-center mt-4 gap-4">
                <button
                  disabled={categoryPage === 0}
                  onClick={() => setCategoryPage(prev => Math.max(prev - 1, 0))}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span>{categoryPage + 1} / {totalCategoryPages}</span>
                <button
                  disabled={categoryPage === totalCategoryPages - 1}
                  onClick={() => setCategoryPage(prev => Math.min(prev + 1, totalCategoryPages - 1))}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Desktop Sync Data Button */}
      <div className="absolute bottom-6 right-6">
        <TutorialBubble
          show={isStep("sync-data")}
          text="Push your menu live."
          position="top"
          onBack={prevStep}
          onDone={finishTutorial}
          isLast
          condition
        >
          <button
            onClick={natsPush}
            disabled={loading || syncing}
            className={`px-6 py-3 rounded-lg font-bold transition hidden sm:block
        ${syncing ? "bg-purple-500 text-white animate-pulse" : ""}
        ${success ? "bg-green-500 text-white" : ""}
        ${!syncing && !success ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
      `}
          >
            {syncing ? "🚀 Launching…" : success ? "✅ Data Synced!" : "Sync Data"}
          </button>
        </TutorialBubble>
      </div>

    </div>
  );
}
