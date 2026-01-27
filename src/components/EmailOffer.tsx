import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import EmailBoard from "./EmailBoard";
import MobileBoard from "./MobileBoard";

export default function EmailOffer() {
    const emails = useSelector((state: RootState) => state.emails.emails);
    const emailStatus = useSelector((state: RootState) => state.emails.status);

    const exportToCSV = () => {
        const csvContent = "Email\n" + emails.map(e => e.email).join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "customer_list.csv";
        link.click();
    };

    const EmailList = (
        <>
            {emailStatus === "loading" ? (
                <p className="text-gray-500 text-center">Loading emails...</p>
            ) : emails.length === 0 ? (
                <p className="text-gray-500 text-center">No emails fetched yet.</p>
            ) : (
                <ul className="space-y-2 md:ml-4">
                    {emails.map((email, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 shadow-sm"
                        >
                            {email.email}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );

    return (
        <>
            {/* DESKTOP */}
            <EmailBoard>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-['Patrick_Hand',sans-serif] text-3xl">
                        Customer List
                    </h1>

                    <button
                        onClick={exportToCSV}
                        className="rounded-md bg-[#696969] px-5 py-2 font-['Patrick_Hand',sans-serif] text-base text-white shadow hover:bg-[#555555]"
                    >
                        Export CSV
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    {EmailList}
                </div>
            </EmailBoard>

            {/* MOBILE */}
            <MobileBoard>
                <div className="mb-6 flex flex-col gap-3">
                    <h1 className="font-['Patrick_Hand',sans-serif] text-2xl text-center">
                        Customer List
                    </h1>

                    <button
                        onClick={exportToCSV}
                        className="w-full rounded-md bg-[#696969] px-4 py-2 font-['Patrick_Hand',sans-serif] text-sm text-white shadow"
                    >
                        Export CSV
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    {EmailList}
                </div>
            </MobileBoard>
        </>
    );
}
