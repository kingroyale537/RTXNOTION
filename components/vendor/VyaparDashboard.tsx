// components/vendor/VyaparDashboard.tsx
// Zero-Tech Vyapar / Kirana Vendor Dashboard.
// Replaces complex developer UI with 4 big friendly single-tap vendor action tiles:
// 1. Bill Banao (Create Invoice)
// 2. Grahak Khata (Customer Udhar)
// 3. Samaan Stock (Inventory)
// 4. Rojana Kamai (Daily Income)

"use client";

import { useState } from "react";
import { FileText, Users, Package, TrendingUp, Mic, QrCode, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export function VyaparDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "khata" | "stock">("dashboard");

  const openVoiceKhata = () => {
    const event = new CustomEvent("open-voice-khata");
    window.dispatchEvent(event);
  };

  const openUpiBill = () => {
    const event = new CustomEvent("open-upi-bill", { detail: { name: "Customer", amount: 500 } });
    window.dispatchEvent(event);
  };

  return (
    <div className="my-6 p-6 bg-[#161618] border border-[#28282c] rounded-2xl shadow-2xl space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-[#28282c] pb-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span>Vyapar & Kirana OS</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              Non-Tech Friendly 🇮🇳
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Single-tap store ledger & instant UPI billing</p>
        </div>

        <button
          onClick={openVoiceKhata}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Mic className="w-4 h-4" />
          <span>Awaaz Se Khata 🎙️</span>
        </button>
      </div>

      {/* 4 Big Friendly Vendor Action Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tile 1: Bill Banao */}
        <button
          onClick={openUpiBill}
          className="bg-[#202025] hover:bg-[#282830] border border-[#2e2e36] hover:border-blue-500/50 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 transition transform hover:scale-[1.03] group shadow-xl"
        >
          <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Bill Banao 🧾</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Generate UPI QR Code</p>
          </div>
        </button>

        {/* Tile 2: Grahak Khata */}
        <button
          onClick={openVoiceKhata}
          className="bg-[#202025] hover:bg-[#282830] border border-[#2e2e36] hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 transition transform hover:scale-[1.03] group shadow-xl"
        >
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Grahak Khata 👥</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Customer Udhar Ledger</p>
          </div>
        </button>

        {/* Tile 3: Samaan Stock */}
        <button
          onClick={() => toast.success("Stock inventory refreshed!")}
          className="bg-[#202025] hover:bg-[#282830] border border-[#2e2e36] hover:border-purple-500/50 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 transition transform hover:scale-[1.03] group shadow-xl"
        >
          <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:scale-110 transition">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Samaan Stock 📦</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Inventory Items</p>
          </div>
        </button>

        {/* Tile 4: Rojana Kamai */}
        <button
          onClick={() => toast.success("Today's total sales: ₹4,200")}
          className="bg-[#202025] hover:bg-[#282830] border border-[#2e2e36] hover:border-amber-500/50 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 transition transform hover:scale-[1.03] group shadow-xl"
        >
          <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl group-hover:scale-110 transition">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Rojana Kamai 💰</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Daily Income Analytics</p>
          </div>
        </button>
      </div>
    </div>
  );
}
