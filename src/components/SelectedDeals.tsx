import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { toggleDeal } from "../features/offers/offerSlice";

type SelectedComponent = {
    setDrinkModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SelectedDeals({ setDrinkModal }: SelectedComponent) {
    const dispatch = useDispatch();

    // ✅ SAFELY normalize to empty object
    const deals =
        useSelector((state: RootState) => state.offers.selectedDeals?.deals) ?? {};
    console.log(deals)
    const dealKeys = Object.keys(deals);
    const hasDeals = dealKeys.length > 0;

    // Track fading out cards
    const [fadingOut, setFadingOut] = useState<Record<string, boolean>>({});

    const handleUnselect = (key: string) => {
        setFadingOut((prev) => ({ ...prev, [key]: true }));

        setTimeout(() => {
            const deal = deals[key];
            if (!deal) return;

            dispatch(
                toggleDeal({
                    name: key,
                    future: deal.future as string,
                    show: deal.show,
                })
            );

            setFadingOut((prev) => {
                const copy = { ...prev };
                delete copy[key];
                return copy;
            });
        }, 200);
    };

    return (
        <>
            <div className="relative w-full max-w-5xl mx-auto px-6 mt-10">
                <h2
                    className="text-center mb-6 font-extrabold text-2xl sm:text-3xl lg:text-4xl text-black"
                    style={{
                        fontFamily: "Sora, sans-serif",
                        textShadow: "0 0.25rem 0.4rem rgba(0,0,0,0.25)",
                    }}
                >
                    Selected Deals
                </h2>

                <div
                    className="relative rounded-full"
                    style={{
                        height: "0.35rem",
                        backgroundImage:
                            "linear-gradient(91deg, rgba(0,0,0,0) 10%, rgba(0,0,0,1) 115%)",
                        boxShadow: "0 0.25rem 0.4rem rgba(0,0,0,0.25)",
                    }}
                >
                    <div className="absolute inset-0 shadow-[inset_0_0.25rem_0.4rem_rgba(0,0,0,0.25)]" />
                </div>

                <div
                    className={`min-h-[8rem] ${hasDeals
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center gap-x-6 gap-y-10"
                        : "flex justify-center items-start"
                        }`}
                >
                    {hasDeals ? (
                        dealKeys.map((key) => {
                            const deal = deals[key];
                            console.log(deal)
                            return (
                                <div
                                    key={key}
                                    className={`
                    flex flex-col items-center w-full
                    animate-fadeIn
                    transition-opacity duration-200 ease-out
                    ${fadingOut[key] ? "opacity-0" : "opacity-100"}
                  `}
                                >
                                    <div
                                        className="bg-[#9a9595]"
                                        style={{ width: "0.3em", height: "1.2em" }}
                                    />

                                    <div
                                        onClick={() => handleUnselect(key)}
                                        className="
                      w-full max-w-[10rem]
                      aspect-square
                      bg-white
                      shadow-[0_0.25rem_0.4rem_rgba(0,0,0,0.25)]
                      flex flex-col items-center justify-center
                      px-3 sm:px-5
                      text-center
                      transition-transform
                      hover:scale-[1.03]
                      active:scale-[0.98]
                      relative
                      paper-noise
                      cursor-pointer
                    "
                                    >
                                        <p
                                            className="text-sm sm:text-base lg:text-lg mb-2"
                                            style={{
                                                fontFamily: "Patrick Hand, sans-serif",
                                                lineHeight: "1.25",
                                            }}
                                        >
                                            {key}
                                        </p>

                                        {key === "Free drink with any meal" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDrinkModal(true);
                                                }}
                                                className="text-xs sm:text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg shadow-sm transition-all"
                                            >
                                                Select Drink
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-600 text-lg sm:text-xl lg:text-2xl mt-8">
                            No deals have been selected
                        </p>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
        </>
    );
}
