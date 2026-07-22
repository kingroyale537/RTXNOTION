// components/vendor/UpiBillModal.tsx
// Dynamic UPI QR Code Billing & WhatsApp Bill Reminder Generator.
// Generates scannable GPay / PhonePe / Paytm UPI QR codes and formats WhatsApp payment links for non-tech vendors.

"use client";

import { useState, useEffect } from "react";
import { QrCode, Send, Copy, X, IndianRupee, CheckCircle2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  customerName?: string;
  amount?: number;
}

export function UpiBillModal({ customerName = "Customer", amount = 500 }: Props) {
  const [open, setOpen] = useState(false);
  const [vpa, setVpa] = useState("voltaicvendor@upi");
  const [billAmount, setBillAmount] = useState(amount);
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const handleOpen = (e: any) => {
      setOpen(true);
      if (e.detail) {
        if (e.detail.name) setName(e.detail.name);
        if (e.detail.amount) setBillAmount(e.detail.amount);
      }
    };
    window.addEventListener("open-upi-bill", handleOpen);
    return () => window.removeEventListener("open-upi-bill", handleOpen);
  }, []);

  const upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent("Voltaic Vendor")}&am=${billAmount}&cu=INR&tn=${encodeURIComponent(`Bill for ${name}`)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const sendWhatsAppReminder = () => {
    const msg = `Namaste ${name} ji,\nAapka Voltaic Store par ₹${billAmount} ka bill baaki hai.\nKripya is link par click karke UPI se pay karein:\n${upiUrl}\nDhanyawad!`;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, "_blank");
    toast.success("WhatsApp bill reminder launched!");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141416] border border-[#2b2b30] rounded-2xl p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">UPI QR Code & WhatsApp Bill</h2>
              <p className="text-xs text-gray-400">GPay / PhonePe / Paytm Scannable QR</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Customer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1c1c20] border border-[#2c2c30] rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Bill Amount (₹)</label>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#1c1c20] border border-[#2c2c30] rounded-xl px-3 py-2 text-emerald-400 font-bold outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 font-semibold mb-1">Customer Mobile Number (Optional)</label>
          <input
            type="text"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#1c1c20] border border-[#2c2c30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Generated Scannable QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner space-y-2">
          <img src={qrImageUrl} alt="UPI QR Code" className="w-44 h-44 rounded-lg" />
          <span className="text-[11px] font-bold text-gray-800 font-mono">
            Scan with GPay / PhonePe / Paytm
          </span>
          <span className="text-[10px] text-gray-500 font-bold">
            Amount: ₹{billAmount}
          </span>
        </div>

        {/* WhatsApp Send Reminder Button */}
        <button
          onClick={sendWhatsAppReminder}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Send className="w-4 h-4" />
          <span>Send Bill on WhatsApp 📱</span>
        </button>
      </div>
    </div>
  );
}
