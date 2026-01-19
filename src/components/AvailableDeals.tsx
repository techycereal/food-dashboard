import { useState } from "react";
import type { DealType } from "../page/Offers";
import { toggleDeal } from "../features/offers/offerSlice";
import type { RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";

type ComponentProps = {
    deals: DealType;
};


export default function AvailableDeals({ deals }: ComponentProps) {
    const dispatch = useDispatch();

    // selectedDeals can be null → guard it
    const selectedDeals =
        useSelector((state: RootState) => state.offers.selectedDeals?.deals) ?? {};

    // Track which cards are fading out
    const [fadingOut, setFadingOut] = useState<Record<string, boolean>>({});

    const availableDeals = Object.entries(deals).filter(
        ([_, deal]) => !selectedDeals || !(deal.name in selectedDeals)
    );

    const handleSelect = (key: string, deal: any) => {
        setFadingOut((prev) => ({ ...prev, [key]: true }));

        setTimeout(() => {
            dispatch(
                toggleDeal({
                    name: deal.name,
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
            <div className="relative w-full max-w-5xl mx-auto px-6">
                <h2
                    className="text-center mb-6 font-extrabold text-2xl sm:text-3xl lg:text-4xl text-black"
                    style={{
                        fontFamily: "Sora, sans-serif",
                        textShadow: "0 0.25rem 0.4rem rgba(0,0,0,0.25)",
                    }}
                >
                    Available Deals
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
                    className={`min-h-[8rem] ${availableDeals.length > 0
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center gap-x-6 gap-y-10"
                        : "flex justify-center items-start"
                        }`}
                >
                    {availableDeals.length > 0 ? (
                        availableDeals.map(([key, deal]) => (
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
                                    onClick={() => handleSelect(key, deal)}
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
                                        className="text-base sm:text-lg lg:text-xl"
                                        style={{
                                            fontFamily: "Patrick Hand, sans-serif",
                                            lineHeight: "1.25",
                                        }}
                                    >
                                        {deal.name}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-600 text-lg sm:text-xl lg:text-2xl mt-8">
                            All deals have been selected
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
