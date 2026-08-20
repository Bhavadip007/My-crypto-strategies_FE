import { useState, useEffect } from "react";
import { Power, Send } from "lucide-react";
import {
  getSettings,
  getSymbols,
  getSignalStatus,
  updateSettings,
} from "./api";

const FALLBACK_CURRENCIES = [
  "BTCUSD",
  "ETHUSD",
  "SOLUSD",
  "XRPUSD",
  "DOGEUSD",
  "ZECUSD",
  "AAVEUSD",
  "HYPEUSD",
  "PAXGUSD",
  "PLTRBUSD",
  "VELVETUSD",
  "SKYAIUSD",
  "RIVERUSD",
  "MONUSD",
  "LABUSD",
  "KAITOUSD",
  "EVAAUSD",
  "BEATUSD",
  "ACTUSD",
];

export default function App() {
  const [botOn, setBotOn] = useState(false);
  const [lotSize, setLotSize] = useState(10);
  const [selectedSymbol, setSelectedSymbol] = useState("ETHUSD");
  const [availableSymbols, setAvailableSymbols] = useState(FALLBACK_CURRENCIES);
  const [symbolQuery, setSymbolQuery] = useState("");
  const [signalInfo, setSignalInfo] = useState(null);
  const [signalError, setSignalError] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadSignal = async () => {
      try {
        const data = await getSignalStatus();
        setSignalInfo(data);
        setSignalError(null);
      } catch (err) {
        console.error(err);
        setSignalError("Could not load signal from bot API");
      }
    };

    loadSettings();
    loadSignal();

    const timer = setInterval(loadSignal, 10000);

    return () => clearInterval(timer);
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();

      setBotOn(data.botEnabled);
      setLotSize(data.lotSize);

      if (data.symbol) {
        setSelectedSymbol(data.symbol);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const symbols = await getSymbols();
      if (Array.isArray(symbols) && symbols.length) {
        setAvailableSymbols(symbols);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setStatus(null);

      const payload = {
        botEnabled: botOn,
        symbol: selectedSymbol,
        lotSize,
        timeframe: "15m",
      };

      await updateSettings(payload);

      setStatus("success");
    } catch (err) {
      console.error(err);

      setStatus(
        err.response?.data?.error || err.message || "Failed to save settings",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold">MACD Bhavadip Bot</h1>

          <p className="text-slate-400 mt-2">Trading Dashboard</p>
        </div>

        {/* Status */}

        <div className="flex items-center gap-2 mb-6">
          <span
            className={`w-3 h-3 rounded-full ${
              botOn ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <span>{botOn ? "Bot Running" : "Bot Stopped"}</span>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Strategy Signal</h2>

          {signalError && (
            <p className="text-amber-400 text-sm mb-3">{signalError}</p>
          )}

          <div
            className={`text-4xl font-bold mb-4 ${
              signalInfo?.signal === "BUY"
                ? "text-green-400"
                : signalInfo?.signal === "SELL"
                  ? "text-red-400"
                  : "text-slate-300"
            }`}
          >
            {signalInfo?.signal || "LOADING"}
          </div>

          <div className="text-sm text-slate-400 space-y-1">
            <p>Position: {signalInfo?.position || "FLAT"}</p>
            <p>
              Hist prev / curr:{" "}
              {Number.isFinite(Number(signalInfo?.histPrev))
                ? Number(signalInfo.histPrev).toFixed(6)
                : "-"}{" "}
              /{" "}
              {Number.isFinite(Number(signalInfo?.histCurr))
                ? Number(signalInfo.histCurr).toFixed(6)
                : "-"}
            </p>
            <p>{signalInfo?.waitingFor || "Waiting for bot..."}</p>
            {signalInfo?.symbol && <p>Pair: {signalInfo.symbol}</p>}
          </div>
        </div>

        {/* Card */}

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
          {/* Bot Switch */}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Power />

              <div>
                <h3 className="font-medium">Trading Bot</h3>

                <p className="text-xs text-slate-400">Enable / Disable Bot</p>
              </div>
            </div>

            <button
              onClick={() => setBotOn(!botOn)}
              className={`w-14 h-7 rounded-full transition ${
                botOn ? "bg-green-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition ${
                  botOn ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Lot Size */}

          <div>
            <label className="block mb-2">Lot Size: {lotSize}</label>

            <input
              type="range"
              min="1"
              max="100"
              value={lotSize}
              onChange={(e) => setLotSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Currency */}

          <div>
            <label className="block mb-3">Currency Pair</label>
            <p className="text-xs text-slate-400 mb-3">
              Select one pair. After you save, the bot places orders on this
              currency from that moment.
            </p>
            <input
              type="search"
              value={symbolQuery}
              onChange={(e) => setSymbolQuery(e.target.value)}
              placeholder="Search pair..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 mb-3"
            />

            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
              {availableSymbols
                .filter((symbol) =>
                  symbol.toLowerCase().includes(symbolQuery.toLowerCase()),
                )
                .map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`px-3 py-2 rounded-lg border ${
                      selectedSymbol === symbol
                        ? "bg-blue-600 border-blue-600"
                        : "border-slate-700"
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Submit */}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl flex justify-center items-center gap-2"
        >
          <Send size={18} />

          {submitting ? "Saving..." : "Save Settings"}
        </button>

        {status === "success" && (
          <p className="text-green-500 mt-4 text-center">Settings Saved</p>
        )}

        {status && status !== "success" && (
          <p className="text-red-500 mt-4 text-center">{status}</p>
        )}
      </div>
    </div>
  );
}
