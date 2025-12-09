import React, { useState } from "react";

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

export default function WifiProvisioner() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Idle");

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
      console.log(characteristic)
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
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Pi Wi-Fi Provisioning</h2>
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
  );
}
