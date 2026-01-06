import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import type { Period } from "../page/Reports";

type ChartComponent = {
    setPeriod: React.Dispatch<React.SetStateAction<Period>>;
    period: Period;
    chartData: any[]
}

export default function Chart({ setPeriod, period, chartData }: ChartComponent) {
    return (
        <div className="flex justify-center ">
            <div className="bg-[#bb8e51] w-full max-w-5xl p-3 rounded-lg relative overflow-hidden paper-noise shadow-[10px_10px_7.8px_0px_rgba(0,0,0,0.25)]">
                <div className="relative w-full h-[250px] sm:h-[400px] flex flex-col items-center bg-white p-4 rounded shadow">

                    {/* Period Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 justify-center w-full font-hand">
                        {(["Daily", "Weekly", "Monthly", "Yearly"] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`flex-1 sm:flex-none text-lg sm:text-sm md:text-2xl ${period === p
                                    ? "border-b-2 border-black"
                                    : "text-black"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                            <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}