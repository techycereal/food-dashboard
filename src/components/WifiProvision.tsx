import { useState, useEffect } from "react";
import { Wifi, X, ShieldCheck, Cpu, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"; // I recommend lucide-react for icons

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

type WiFiProps = {
  closeModal: () => void;
};

export default function WifiProvisionerModal({ closeModal }: WiFiProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(closeModal, 300);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      setStatus("Pairing with Hub...");
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ name: "Pi4-BLE-WiFi" }],
        optionalServices: [SERVICE_UUID],
      });

      setStatus("Configuring connection...");
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHAR_UUID);

      const payload = JSON.stringify({ ssid, password });
      await characteristic.writeValue(new TextEncoder().encode(payload));

      setStatus("Success");
      await server.disconnect();
    } catch (error) {
      console.error(error);
      setStatus("Error: Connection Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ease-out 
        ${isVisible ? "translate-y-0 scale-100" : "translate-y-12 scale-95"}`}
      >
        {/* Header Section */}
        <div className="bg-blue-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-blue-500 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wifi size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Hub Provisioning</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Connect your CurbSuite Hub to the internet to sync updates and reports.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Tracker */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="animate-spin text-blue-600" size={18} />
              ) : status === "Success" ? (
                <CheckCircle2 className="text-green-500" size={18} />
              ) : (
                <Cpu className="text-slate-400" size={18} />
              )}
              <span className="text-sm font-medium text-slate-700">{status}</span>
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${status === "Success" ? "text-green-600" : "text-slate-400"}`}>
              System Status
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                Network Name (SSID)
              </label>
              <input
                type="text"
                placeholder="e.g. Home_WiFi_2G"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleConnect}
            disabled={isLoading || !ssid}
            className={`group w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all
              ${isLoading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
              }`}
          >
            {isLoading ? "Communicating..." : "Connect to Hub"}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          {/* Footer Info */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-center text-slate-400 leading-relaxed">
              Once provisioned, the Hub can work offline. Data will sync automatically whenever a connection is available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}