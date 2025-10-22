// src/components/ReportsDashboard.tsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { fetchReports, fetchTimeReports } from "../features/reports/reportSlice";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";
import "@tailwindplus/elements";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { clearAuth, setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

type Period = "daily" | "weekly" | "monthly" | "yearly";

export default function ReportsDashboard() {
  const [period, setPeriod] = useState<Period>("daily");
  const [chartData, setChartData] = useState<any[]>([]);
  const [bestSeller, setBestSeller] = useState<{ item: string; quantity: number } | null>(null);
  const timePeriods = useSelector((state: RootState) => state.reports.timeReports);

  const reports = useSelector((state: RootState) => state.reports.reports);
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate()
  // Fetch individual transactions
  useEffect(() => {
    if (reports.length === 0) {
      dispatch(fetchReports() as any);
    }
  }, [dispatch, reports.length]);

  const { user } = useSelector((state: any) => state.auth);
      useEffect(() => {
        const auth = getAuth();
    
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken(true);
            dispatch(
              setCredentials({
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                },
                token,
              })
            );
            dispatch(fetchTimeReports() as any)
          } else {
            dispatch(clearAuth());
            navigate("/signin");
          }
        });
    
        return () => unsubscribe();
      }, [dispatch, navigate]);

      if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#b8f2f1]">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  // Update chart + best seller whenever period changes
  useEffect(() => {
    if (!timePeriods.length) return;

    const filtered = timePeriods.filter((tp) => {
      switch (period) {
        case "daily":
          return tp.periodType === "day";
        case "weekly":
          return tp.periodType === "week";
        case "monthly":
          return tp.periodType === "month";
        case "yearly":
          return tp.periodType === "year";
        default:
          return false;
      }
    });

    // Prepare chart data
    const formatted = filtered.map((tp) => ({
      period: tp.period,
      revenue: tp.totalRevenue,
      orders: tp.orderCount,
    }));
    console.log(formatted)
    setChartData(formatted);

    // Calculate best seller for selected period
    const combinedItems: Record<string, number> = {};
    filtered.forEach((tp) => {
      Object.entries(tp.itemsSold).forEach(([item, qty]) => {
        combinedItems[item] = (combinedItems[item] || 0) + (qty as number);
      });
    });

    let topItem: { item: string; quantity: number } | null = null;
    for (const [item, qty] of Object.entries(combinedItems)) {
      if (!topItem || qty > topItem.quantity) {
        topItem = { item, quantity: qty };
      }
    }
    setBestSeller(topItem);
  }, [timePeriods, period]);

  // Dashboard widgets (KPI metrics)
  const currentSummary = (() => {
    const filtered = timePeriods.filter((tp) => {
      switch (period) {
        case "daily":
          return tp.periodType === "day";
        case "weekly":
          return tp.periodType === "week";
        case "monthly":
          return tp.periodType === "month";
        case "yearly":
          return tp.periodType === "year";
        default:
          return false;
      }
    });
    const totalRevenue = filtered.reduce((acc, f) => acc + f.totalRevenue, 0);
    const totalOrders = filtered.reduce((acc, f) => acc + f.orderCount, 0);
    const uniqueCustomers = new Set(filtered.flatMap((f) => f.uniqueCustomers || [])).size;

    return { totalRevenue, totalOrders, uniqueCustomers };
  })();

  return (
    <div className="w-full min-h-screen bg-[#b8f2f1] p-4 sm:p-6 flex flex-col gap-8 items-center justify-center">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Menu Button */}
      {!mobileOpen && (
        <div className="absolute top-4 left-4 md:hidden z-40">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded bg-white shadow-md"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Widgets */}
      {timePeriods.length > 0 && (
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white border-2 border-black rounded shadow p-4 text-center">
          <h2 className="text-sm font-bold">Total Revenue</h2>
          <p className="text-lg">${currentSummary.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white border-2 border-black rounded shadow p-4 text-center">
          <h2 className="text-sm font-bold">Total Orders</h2>
          <p className="text-lg">{currentSummary.totalOrders}</p>
        </div>
        <div className="bg-white border-2 border-black rounded shadow p-4 text-center">
          <h2 className="text-sm font-bold">Unique Customers</h2>
          <p className="text-lg">{currentSummary.uniqueCustomers}</p>
        </div>
        {bestSeller && (
          <div className="bg-white border-2 border-black rounded shadow p-4 text-center">
            <h2 className="text-sm font-bold">Best Seller</h2>
            <p className="text-lg">
              {bestSeller.item} ({bestSeller.quantity} sold)
            </p>
          </div>
        )}
      </div>
      )}
      

      {/* Chart Section */}
      <div className="w-full h-[250px] sm:h-[400px] flex flex-col items-center bg-white p-4 border-black border-2 rounded shadow">
        {/* Period Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 justify-center w-full">
          {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm md:text-base ${
                period === p
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
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
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
            <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto bg-white border-black border-2 rounded p-4 shadow">
        <table className="min-w-full border border-gray-300 text-xs sm:text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left whitespace-nowrap">Customer</th>
              <th className="border p-2 text-left whitespace-nowrap">Transaction ID</th>
              <th className="border p-2 text-left">Items</th>
              <th className="border p-2 text-left whitespace-nowrap">Total Price</th>
              <th className="border p-2 text-left whitespace-nowrap">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="border p-2">{report.email}</td>
                <td className="border p-2">{report.id}</td>
                <td className="border p-2">
                  <ul className="list-disc ml-4">
                    {report.items.map((obj, idx) => {
                      const key = Object.keys(obj)[0];
                      const entry = obj[key];
                      return (
                        <li key={idx}>
                          {entry.item} (x{entry.quantity})
                        </li>
                      );
                    })}
                  </ul>
                </td>
                <td className="border p-2">${(report.price / 100).toFixed(2)}</td>
                <td className="border p-2 whitespace-nowrap">
                  {new Date(report._ts * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
