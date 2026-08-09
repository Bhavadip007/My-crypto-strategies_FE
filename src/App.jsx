import { useState, useEffect } from "react";
import { Power, Send, TrendingDown, ShieldAlert } from "lucide-react";
import {
  getSettings,
  updateSettings,
} from "./api";

const CURRENCIES = ["ETHUSD", "BTCUSD", "SOLUSD", "XRPUSD"];

export default function App() {
  const [botOn, setBotOn] = useState(false);
  const [lotSize, setLotSize] = useState(10);
  const [currencies, setCurrencies] = useState(["ETHUSD"]);
  const [stopLoss, setStopLoss] = useState(15);
  const [trailingOn, setTrailingOn] = useState(true);
  const [trailingStop, setTrailingStop] = useState(5);

  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();

      setBotOn(data.botEnabled);
      setLotSize(data.lotSize);
      setStopLoss(data.stopLoss);
      setTrailingStop(data.trailingStop);

      if (data.symbol) {
        setCurrencies([data.symbol]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCurrency = (symbol) => {
    setCurrencies((prev) =>
      prev.includes(symbol)
        ? prev.filter((item) => item !== symbol)
        : [...prev, symbol],
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setStatus(null);

      const payload = {
        botEnabled: botOn,
        symbol: currencies[0],
        lotSize,
        stopLoss,
        trailingStop,
        timeframe: "15m",
      };

      await updateSettings(payload);

      setStatus("success");
    } catch (err) {
      console.error(err);

      setStatus("error");
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

            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => toggleCurrency(symbol)}
                  className={`px-3 py-2 rounded-lg border ${
                    currencies.includes(symbol)
                      ? "bg-blue-600 border-blue-600"
                      : "border-slate-700"
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Stop Loss */}

          <div>
            <label className="flex items-center gap-2 mb-2">
              <ShieldAlert size={16} />
              Stop Loss
            </label>

            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2"
            />
          </div>

          {/* Trailing */}

          <div>
            <div className="flex justify-between mb-2">
              <label className="flex items-center gap-2">
                <TrendingDown size={16} />
                Trailing Stop
              </label>

              <input
                type="checkbox"
                checked={trailingOn}
                onChange={() => setTrailingOn(!trailingOn)}
              />
            </div>

            <input
              type="number"
              disabled={!trailingOn}
              value={trailingStop}
              onChange={(e) => setTrailingStop(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 disabled:opacity-50"
            />
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

        {status === "error" && (
          <p className="text-red-500 mt-4 text-center">Failed To Save</p>
        )}
      </div>
    </div>
  );
}
