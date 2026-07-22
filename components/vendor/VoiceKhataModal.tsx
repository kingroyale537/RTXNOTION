// components/vendor/VoiceKhataModal.tsx
// Vernacular Voice Khata Engine for Local Non-Tech Vendors.
// Transcribes spoken voice entries in Hindi, Hinglish, Tamil, Telugu, Marathi, Gujarati, and English
// and automatically extracts Customer Name, Udhar Amount, and Transaction Notes.

"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Check, X, Sparkles, UserCheck, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onAddKhataEntry?: (entry: { name: string; amount: number; notes: string; status: string }) => void;
}

export function VoiceKhataModal({ onAddKhataEntry }: Props) {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState("hi-IN"); // Hindi / Hinglish default
  const [parsedData, setParsedData] = useState<{ name: string; amount: number; notes: string }>({
    name: "",
    amount: 0,
    notes: "",
  });

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-voice-khata", handleOpen);
    return () => window.removeEventListener("open-voice-khata", handleOpen);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
      parseKhataFromSpeech(current);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const parseKhataFromSpeech = (text: string) => {
    // Extract numbers from text (e.g. 500, 1200)
    const numbers = text.match(/\d+/g);
    const amount = numbers ? parseInt(numbers[0], 10) : 0;

    // Simple entity parsing for customer name
    let name = "Customer";
    const words = text.split(" ");
    if (words.length > 0 && words[0].length > 2) {
      name = words[0].replace(/[^a-zA-Z\u0900-\u097F]/g, "");
    }

    setParsedData({
      name: name || "Grahak",
      amount,
      notes: text,
    });
  };

  const handleSave = () => {
    if (!parsedData.name || !parsedData.amount) {
      toast.error("Please specify customer name and amount.");
      return;
    }

    if (onAddKhataEntry) {
      onAddKhataEntry({
        name: parsedData.name,
        amount: parsedData.amount,
        notes: parsedData.notes || "Voice Khata Entry",
        status: "Udhar (Unpaid)",
      });
    }

    toast.success(`Khata entry saved for ${parsedData.name} - ₹${parsedData.amount}!`);
    setOpen(false);
    setTranscript("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#141416] border border-[#2b2b30] rounded-2xl p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Awaaz Se Khata (Voice Ledger)</h2>
              <p className="text-xs text-gray-400">Speak in your language to log credit / udhar</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector */}
        <div className="flex items-center justify-between bg-[#1c1c20] p-2.5 rounded-xl border border-[#2a2a30] text-xs">
          <span className="text-gray-400 font-semibold">Voice Language:</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-[#121215] text-emerald-300 font-bold outline-none px-2 py-1 rounded cursor-pointer"
          >
            <option value="hi-IN">🇮🇳 Hindi / Hinglish (हिंदी)</option>
            <option value="en-IN">🌐 English (India)</option>            <option value="ta-IN">🇮🇳 Tamil (தமிழ்)</option>
            <option value="te-IN">🇮🇳 Telugu (తెలుగు)</option>
            <option value="mr-IN">🇮🇳 Marathi (मराठी)</option>
            <option value="gu-IN">🇮🇳 Gujarati (ગુજરાતી)</option>
          </select>
        </div>

        {/* Mic recording button */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform ${
              isListening
                ? "bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-500/50"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="text-xs text-gray-400 font-medium">
            {isListening ? "Listening... Speak now (e.g. Ramesh ko 500 rupaye udhar diya)" : "Tap microphone to start speaking"}
          </p>
        </div>

        {/* Transcript & Parsed Entry Display */}
        {transcript && (
          <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-xl p-3.5 space-y-2 text-xs">
            <p className="text-gray-400 italic">"{transcript}"</p>
            <div className="pt-2 border-t border-[#25252b] grid grid-cols-2 gap-2">
              <div className="bg-[#121215] p-2 rounded-lg border border-[#222]">
                <span className="text-gray-500 block font-semibold">Grahak (Name)</span>
                <input
                  type="text"
                  value={parsedData.name}
                  onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                  className="bg-transparent font-bold text-white outline-none w-full"
                />
              </div>
              <div className="bg-[#121215] p-2 rounded-lg border border-[#222]">
                <span className="text-gray-500 block font-semibold">Amount (₹)</span>
                <input
                  type="number"
                  value={parsedData.amount}
                  onChange={(e) => setParsedData({ ...parsedData, amount: parseInt(e.target.value, 10) || 0 })}
                  className="bg-transparent font-bold text-emerald-400 outline-none w-full"
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!parsedData.amount}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>Save Voice Khata Entry</span>
        </button>
      </div>
    </div>
  );
}
