// components/PlaqueModal.tsx
interface PlaqueModalProps {
    isOpen: boolean;
    businessName: string;
    setBusinessName: (val: string) => void;
    handleSaveName: (businessName: string) => void;
}

export default function PlaqueModal({
    isOpen,
    businessName,
    setBusinessName,
    handleSaveName,
}: PlaqueModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* The Dark Overlay Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
            />

            {/* Floating Plaque Container */}
            <div className="relative w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-300">

                {/* The Plaque Visuals */}
                <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#844e22] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] p-[4%] border-4 border-[#6d3d1a]">
                    <div className="w-full h-full bg-[#f0e68c] p-[3%] rounded-sm shadow-inner">
                        <div className="w-full h-full bg-[#141414] flex flex-col items-center text-center text-[#ebe6b9] p-8 relative overflow-hidden border border-black/20">

                            {/* Top Header Text */}
                            <p className="mt-6 font-['Italianno',cursive] text-4xl text-[#f0e68c]">Thank you</p>
                            <p className="mt-1 font-['Platypi',serif] text-xs tracking-[0.2em] uppercase opacity-80">
                                For joining CurbSuite
                            </p>

                            {/* Business Name Section */}
                            <div className="mt-12 flex flex-col items-center w-full">
                                <p className="font-['Sora',sans-serif] text-[10px] font-bold opacity-50 uppercase tracking-[0.3em]">
                                    We are proud to present
                                </p>
                                <div className="w-full relative mt-4">
                                    <input
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Enter Business Name"
                                        className="w-full font-['Sora',sans-serif] font-bold text-2xl text-center bg-transparent border-b border-[#f0e68c]/10 focus:border-[#f0e68c] focus:outline-none py-2 text-[#f0e68c] placeholder:opacity-20"
                                    />
                                    <p className="mt-4 font-['Platypi',serif] text-sm tracking-wide">
                                        With this plaque
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Appreciation */}
                            <div className="mt-auto mb-8">
                                <p className="font-['Platypi',serif] text-[10px] uppercase tracking-widest opacity-60 max-w-[200px] leading-relaxed">
                                    In recognition of your excellence and partnership
                                </p>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={() => handleSaveName(businessName)}
                                className="absolute bottom-4 right-4 bg-[#f0e68c] text-black text-[10px] font-black px-4 py-2 rounded-md hover:bg-white active:scale-95 transition-all shadow-lg"
                            >
                                SAVE CHANGES
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}