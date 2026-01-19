type CurrentSummary = {
    totalRevenue: number;
    totalOrders: string;
    uniqueCustomers: number;
};

type BestSeller = {
    item: string;
    quantity: number;
};

type ReportBoardComponent = {
    currentSummary: CurrentSummary;
    bestSeller: BestSeller | null;
};

export default function ReportBoard({ currentSummary, bestSeller }: ReportBoardComponent) {
    return (
        <div className="
            grid grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-4 sm:gap-6
            w-3/4
            md:w-1/2
            mx-auto
            bg-[#BB8E51]
            p-4 sm:p-6
            rounded-xl
            shadow-lg
            place-items-center
            font-hand
            text-xl
            relative overflow-hidden
            paper-noise
            shadow-[10px_10px_7.8px_0px_rgba(0,0,0,0.25)]
        ">

            {/* Card Base */}
            {[
                {
                    label: "Total Revenue",
                    value: `$${currentSummary.totalRevenue.toFixed(2)}`,
                },
                {
                    label: "Total Orders",
                    value: currentSummary.totalOrders,
                },
                {
                    label: "Unique Customers",
                    value: currentSummary.uniqueCustomers,
                },
            ].map(({ label, value }) => (
                <div
                    key={label}
                    className="
                        bg-[#FFFF88]
                        shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                        flex flex-col items-center justify-center
                        p-3 sm:p-4
                        aspect-square
                        w-full max-w-[160px]
                        text-xl
                    "
                >
                    <h3 className="text-xl sm:text-xs font-semibold text-gray-700">
                        {label}
                    </h3>
                    <p className="text-xl sm:text-lg font-bold text-gray-900 mt-1">
                        {value}
                    </p>
                </div>
            ))}

            {/* Best Seller */}
            <div className="
                    bg-[#FFFF88]
                    shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                    flex flex-col items-center justify-center
                    p-3 sm:p-4
                    aspect-square
                    w-full max-w-[160px]
                ">
                <h3 className="text-[11px] sm:text-xs font-semibold text-gray-700">
                    Best Seller
                </h3>
                <p className="text-sm sm:text-base font-medium text-gray-900 text-center mt-1 leading-tight">
                    {bestSeller ?
                        <>
                            {bestSeller.item}
                            <span className="block text-xs text-gray-600">
                                ({bestSeller.quantity} sold)
                            </span></>
                        :
                        <span className="text-xl sm:text-lg font-bold text-gray-900 mt-1">None</span>
                    }
                </p>
            </div>
        </div>
    );
}

