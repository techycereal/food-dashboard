import { useState, useEffect } from "react";

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

type WiFiProps = {
  closeModal: () => void;
}

export default function WifiProvisionerModal({ closeModal }: WiFiProps) {

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Idle");
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10); // small delay to trigger transition
    return () => clearTimeout(timer);
  }, []);
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(closeModal, 300)
  }

  const handleConnect = async () => {
    try {
      setStatus("Requesting Pi BLE device...");
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ name: "Pi4-BLE-WiFi" }],
        optionalServices: [SERVICE_UUID],
      });

      setStatus("Connecting to Pi...");
      const server = await device.gatt.connect();

      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHAR_UUID);

      const payload = JSON.stringify({ ssid, password });
      await characteristic.writeValue(new TextEncoder().encode(payload));

      setStatus("Wi-Fi credentials sent! Disconnecting...");
      await server.disconnect();
      setStatus("Success! Pi should connect to Wi-Fi shortly.");
    } catch (error) {
      console.error(error);
      setStatus("Failed to connect or send credentials.");
    }
  };

  return (
    <>

      {/* Modal */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 `}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={() => handleClose()}
        />

        {/* Modal content */}
        <div
          className={`
    relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10
    transform transition-all duration-300 ease-out
    ${isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-20 opacity-0"}
  `}
        >
          {/* Close button */}
          <button
            onClick={() => handleClose()}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-lg"
          >
            ×
          </button>

          <h2 className="text-xl font-bold mb-4">Connect Your CurbSuite Hub to the Internet</h2>
          <p className="text-md mb-4 text-gray-700">
            To receive items, updates, emails, and reporting data, your CurbSuite Hub must be connected to the internet at least once.
          </p>
          <p className="text-md mb-2 text-gray-700">
            Follow these simple steps:
          </p>
          <ol className="list-decimal list-inside mb-4 text-gray-700">
            <li>Plug in your CurbSuite Hub.</li>
            <li>Enter your Wi-Fi name and password, then click "Connect to Pi".</li>
          </ol>
          <p className="text-md text-gray-700">
            Once connected, your hub will automatically receive new items, updates, emails, and reporting data. After that, it can work offline.
          </p>


          <label className="block mb-2">
            SSID:
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </label>

          <label className="block mb-4">
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </label>

          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Connect to Pi
          </button>

          <p className="mt-4 font-medium">Status: {status}</p>
        </div>
      </div>
      <style>{`
    @keyframes slideDown {
      0% { transform: translateY(-50px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
  `}</style>
    </>
  );
}
