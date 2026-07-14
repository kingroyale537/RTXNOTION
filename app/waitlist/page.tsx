// app/waitlist/page.tsx
// Interactive early-access waitlist landing page mirroring the design.

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  Globe, 
  Moon, 
  Sparkles, 
  Send, 
  Loader2 
} from "lucide-react";

// Custom SVG Avatars to guarantee high-quality offline visuals
const AvatarGroup = () => (
  <div className="flex -space-x-2.5 overflow-hidden">
    {/* Avatar 1 */}
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#0f0f12] overflow-hidden bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
    {/* Avatar 2 */}
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#0f0f12] overflow-hidden bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
    {/* Avatar 3 */}
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#0f0f12] overflow-hidden bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  </div>
);

// Key features cards
const features = [
  {
    title: "Intelligent Automation",
    icon: (
      <svg className="w-5 h-5 text-white dark:text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    )
  },
  {
    title: "Predictive Intelligence",
    icon: (
      <svg className="w-5 h-5 text-white dark:text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3M18 6l-12 12m0-12l12 12" />
      </svg>
    )
  },
  {
    title: "Seamless Integration",
    icon: (
      <svg className="w-5 h-5 text-white dark:text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-8.904m-8.904 3.808L18 4.5M18 4.5l-8.904 8.904m8.904-8.904L9 21" />
      </svg>
    )
  }
];

export default function WaitlistPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Waitlist subscription submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      toast.success("Successfully joined the waitlist! 🎉");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to join. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 sm:p-6 transition-colors duration-500 overflow-y-auto">
      {/* Outer mock card interface */}
      <div 
        className={`w-full max-w-[900px] rounded-[32px] overflow-hidden shadow-2xl transition-colors duration-500 border ${
          theme === "light" 
            ? "bg-[#fafafa] border-zinc-200/50 text-zinc-900" 
            : "bg-[#09090b] border-zinc-800/50 text-zinc-100"
        }`}
      >
        <div className="px-6 py-10 sm:px-16 sm:py-16 flex flex-col items-center relative">
          
          {/* Custom Theme Switcher Pill */}
          <div className="mb-12">
            <div 
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`relative flex items-center p-1 rounded-full cursor-pointer select-none w-[90px] h-[40px] border transition-colors duration-300 ${
                theme === "light" 
                  ? "bg-white border-zinc-200/80 shadow-sm" 
                  : "bg-zinc-900 border-zinc-800/80"
              }`}
            >
              {/* Sliding Background */}
              <motion.div 
                layout 
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`absolute top-1 bottom-1 w-[38px] rounded-full shadow-sm ${
                  theme === "light" ? "bg-zinc-900 left-1" : "bg-white right-1"
                }`}
              />
              
              {/* Globe (Light Mode Option) */}
              <div className="flex-1 flex items-center justify-center z-10">
                <Globe 
                  className={`w-4 h-4 transition-colors duration-300 ${
                    theme === "light" ? "text-white" : "text-zinc-500 hover:text-zinc-400"
                  }`} 
                />
              </div>

              {/* Moon (Dark Mode Option) */}
              <div className="flex-1 flex items-center justify-center z-10">
                <Moon 
                  className={`w-4 h-4 transition-colors duration-300 ${
                    theme === "dark" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
                  }`} 
                />
              </div>
            </div>
          </div>

          {/* Badge: Beyond Artificial */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-6 tracking-wide select-none ${
              theme === "light"
                ? "bg-zinc-100/70 text-zinc-600 border-zinc-200/40"
                : "bg-zinc-900/70 text-zinc-400 border-zinc-800/40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beyond Artificial</span>
          </motion.div>

          {/* Main Title Header */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-3.5xl sm:text-[44px] font-extrabold tracking-tight text-center max-w-xl leading-[1.1] mb-5 select-none ${
              theme === "light" ? "text-[#18181b]" : "text-white"
            }`}
          >
            Early Access to <br />
            Game-Changing AI
          </motion.h1>

          {/* Subheading Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-center max-w-[420px] text-[14px] sm:text-[15px] leading-relaxed mb-8 ${
              theme === "light" ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Unlock exclusive early access to groundbreaking AI. <br className="hidden sm:inline" />
            Subscribe now and stay ahead of the future!
          </motion.p>

          {/* Subscription Input Form */}
          <motion.form 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className={`flex items-center p-1.5 rounded-full w-full max-w-[410px] shadow-sm mb-6 border focus-within:ring-2 transition-all duration-300 ${
              theme === "light"
                ? "bg-zinc-100/50 border-zinc-200/80 focus-within:ring-zinc-900/10"
                : "bg-zinc-900/50 border-zinc-800/80 focus-within:ring-white/10"
            }`}
          >
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Your Email" 
              className={`bg-transparent text-[14px] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none flex-1 px-4 py-2 w-full ${
                theme === "light" ? "text-zinc-900" : "text-white"
              }`}
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full font-semibold transition text-xs sm:text-sm active:scale-[0.98] shadow-sm ${
                theme === "light"
                  ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                  : "bg-white hover:bg-zinc-100 text-zinc-950"
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Subscribe</span>
            </button>
          </motion.form>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2.5 mb-14"
          >
            <AvatarGroup />
            <span className={`text-[12px] font-medium ${
              theme === "light" ? "text-zinc-500" : "text-zinc-400"
            }`}>
              Trusted by 1,000+ early adopters
            </span>
          </motion.div>

          {/* Bottom Card Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-[760px] pt-6 border-t border-zinc-200/30 dark:border-zinc-800/30">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative px-5 py-8 rounded-[20px] flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
                  theme === "light" 
                    ? "bg-[#fcfcfc] border border-zinc-200/20" 
                    : "bg-[#111115] border border-zinc-800/30"
                }`}
              >
                {/* Floating Icon Container */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-4 border-4 ${
                    theme === "light"
                      ? "bg-zinc-900 border-white text-white"
                      : "bg-zinc-800 border-[#09090b] text-white"
                  }`}
                >
                  {feature.icon}
                </div>
                
                {/* Feature Title */}
                <h3 className={`text-[14px] font-bold text-center select-none ${
                  theme === "light" ? "text-zinc-800" : "text-zinc-200"
                }`}>
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
