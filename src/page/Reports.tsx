import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import {
  fetchReports,
  fetchTimeReports,
  fetchPurchases,
} from "../features/reports/reportSlice";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";
import "@tailwindplus/elements";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { clearAuth, setCredentials } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import ReportBoard from "../components/ReportBoard";
import EmailBoard from "../components/EmailBoard";
import MobileBoard from "../components/MobileBoard";
import Chart from "../components/Chart";
import { FaClipboardList } from "react-icons/fa";
import { TutorialBubble } from "../components/TutorialBubble";
import { changeTutorialStatusAsync, fetchTutorial } from "../features/products/productSlice";
import type { ReportsState } from "../features/reports/reportSlice";

export type Period = "Daily" | "Weekly" | "Monthly" | "Yearly";

const LOADING_MESSAGES = [
  "Updating reports...",
  "Looking at data right now hold on...",
  "Crunching the numbers...",
  "Organizing your sales...",
  "Almost there...",
];

export default function ReportsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [period, setPeriod] = useState<Period>("Daily");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false); // New flag

  const tutorial = useSelector((state: RootState) => state.products.tutorial);
  const { user } = useSelector((state: RootState) => state.auth);
  const { reports, timeReports, status, timeStatus } = useSelector(
    (state: RootState) => state.reports as ReportsState
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Run fetches in parallel for better performance
      await Promise.all([
        dispatch(fetchPurchases()),
        dispatch(fetchReports()),
        dispatch(fetchTimeReports())
      ]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  // Auth Effect
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(clearAuth());
        navigate("/signin");
        return;
      }
      dispatch(setCredentials({
        user: { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName },
        token: await firebaseUser.getIdToken(true),
      }));
      dispatch(fetchTutorial());
    });
    return unsubscribe;
  }, [dispatch, navigate]);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      if (user) {
        await handleRefresh();
        setHasInitialized(true); // Mark as loaded once data arrives
      }
    };
    init();
  }, [user, handleRefresh]);

  // Loading text rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "loading" || timeStatus === "loading" || !hasInitialized) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status, timeStatus, hasInitialized]);

  // Derived Data (keep your existing useMemos here)
  const filteredPeriods = useMemo(() => {
    return timeReports.filter((tp) => {
      switch (period) {
        case "Daily": return tp.periodType === "day";
        case "Weekly": return tp.periodType === "week";
        case "Monthly": return tp.periodType === "month";
        case "Yearly": return tp.periodType === "year";
        default: return false;
      }
    });
  }, [timeReports, period]);

  const chartData = useMemo(() =>
    filteredPeriods.map((tp) => ({
      period: tp.period,
      revenue: tp.totalRevenue,
      orders: tp.orderCount,
    })), [filteredPeriods]);

  const bestSeller = useMemo(() => {
    const tally: Record<string, number> = {};
    filteredPeriods.forEach((tp) => {
      Object.entries(tp.itemsSold).forEach(([item, qty]) => {
        tally[item] = (tally[item] || 0) + Number(qty);
      });
    });
    return Object.entries(tally).reduce(
      (best, [item, qty]) => (!best || qty > best.quantity ? { item, quantity: qty } : best),
      null as { item: string; quantity: number } | null
    );
  }, [filteredPeriods]);

  const currentSummary = useMemo(() => ({
    totalRevenue: filteredPeriods.reduce((acc, f) => acc + f.totalRevenue, 0),
    totalOrders: filteredPeriods.reduce((acc, f) => acc + f.orderCount, 0),
    uniqueCustomers: new Set(filteredPeriods.flatMap((f) => f.uniqueCustomers || [])).size,
  }), [filteredPeriods]);

  // Updated Loading condition
  const isLoading = !user || !hasInitialized || status === "loading" || timeStatus === "loading";

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6" style={{ backgroundImage: "linear-gradient(137.884deg, rgba(222,242,243,1) 0%, rgb(214,242,244) 50.018%)" }}>
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="relative flex items-center justify-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-500" />
          <div className="absolute h-10 w-10 rounded-full bg-blue-100/50" />
        </div>
        <p className="text-xl font-hand animate-pulse text-blue-800 tracking-wide">{LOADING_MESSAGES[loadingMessageIndex]}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 flex flex-col gap-8" style={{ backgroundImage: "linear-gradient(137.884deg, rgba(222,242,243,1) 0%, rgb(214,242,244) 50.018%)" }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <TutorialBubble show={tutorialStep === 0 && tutorial.reports === true} text="This overview shows your total revenue, orders, and best sellers." position="bottom" onNext={() => setTutorialStep(1)} condition>
        <ReportBoard currentSummary={currentSummary} bestSeller={bestSeller} />
      </TutorialBubble>

      <div className="fixed top-4 right-4 z-50">
        <TutorialBubble show={tutorialStep === 1 && tutorial.reports === true} text="After the event click this button to upload ALL your transaction" position="left" onBack={() => setTutorialStep(0)} onNext={() => setTutorialStep(2)} condition>
          <button className="bg-blue-400 px-3 py-3 rounded-full text-white transition-transform active:scale-90 shadow-lg" onClick={handleRefresh} disabled={isRefreshing}>
            <FaClipboardList size={24} />
          </button>
        </TutorialBubble>
      </div>

      <TutorialBubble show={tutorialStep === 2 && tutorial.reports === true} text={`Use this chart to see your: Daily, Weekly,\nMonthly, and Yearly performance.`} position="top" onBack={() => setTutorialStep(1)} onNext={() => setTutorialStep(3)} condition>
        <Chart period={period} setPeriod={setPeriod} chartData={chartData} />
      </TutorialBubble>

      <TutorialBubble show={tutorialStep === 3 && tutorial.reports === true} text="Here you can review individual transactions and customer purchases." position="top" onBack={() => setTutorialStep(2)} onDone={() => dispatch(changeTutorialStatusAsync('reports'))} isLast condition>
        <EmailBoard>
          <div className="font-hand h-full overflow-y-auto ml-4">
            <h2 className="text-center font-bold text-3xl mb-4">Transaction Report</h2>
            {reports.length > 0 ? (
              <table className="overflow-y min-w-full text-xs sm:text-sm md:text-base">
                <thead>
                  <tr>
                    <th className="p-2 text-left whitespace-nowrap">Customer</th>
                    <th className="p-2 text-left">Items</th>
                    <th className="p-2 text-left whitespace-nowrap">Total Price</th>
                    <th className="p-2 text-left whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 border-t">
                      <td className="p-2">{report.email || 'No Email'}</td>
                      <td className="p-2">
                        <ul className="list-disc ml-4 space-y-1">
                          {report.items.map((obj, idx) => (
                            <li key={idx}>{obj.item} (x{obj.quantity})</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2 whitespace-nowrap">${(report.totalPrice).toFixed(2)}</td>
                      <td className="p-2 whitespace-nowrap">{new Date(report._ts * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-center text-lg">No Transactions</p>}
          </div>
        </EmailBoard>
      </TutorialBubble>

      <MobileBoard>
        <div className="overflow-y-auto font-hand">
          <h1 className="text-center font-bold text-2xl pb-6">Transactions</h1>
          {reports.map((report) => (
            <div key={report.id} className="hover:bg-gray-50 border-t">
              <h1 className="p-2 font-bold text-sm">Date: {new Date(report._ts * 1000).toLocaleString()}</h1>
              <p className="p-2 text-sm"><span>Customer: </span>{report.email || 'No Email'}</p>
              <div className="p-2">
                {report.items.map((obj, idx) => <p key={idx}>Items: {obj.item} (x{obj.quantity})</p>)}
              </div>
              <p className="p-2 whitespace-nowrap">Total Payment: ${(report.totalPrice).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </MobileBoard>
    </div>
  );
}