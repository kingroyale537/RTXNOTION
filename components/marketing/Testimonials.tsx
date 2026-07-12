// components/marketing/Testimonials.tsx
"use client";

import { useEffect, useRef } from "react";
import { Quote, MessageSquare } from "lucide-react";
import { gsap } from "gsap";

export function Testimonials() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth infinite scrolling animation for logos
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const scrollWidth = marquee.scrollWidth;
    
    // We clone the contents to make it seamless
    const clone = marquee.innerHTML;
    marquee.innerHTML += clone;

    gsap.to(marquee, {
      x: `-${scrollWidth / 2}`,
      ease: "none",
      duration: 25,
      repeat: -1,
    });
  }, []);

  return (
    <section id="testimonials" className="w-full bg-[#fafafa] dark:bg-card/10 py-20 border-t border-border/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        
        {/* Title */}
        <div className="text-center space-y-4">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
            Trusted by teams at
          </span>
          {/* Logo Marquee Wrapper */}
          <div className="w-full overflow-hidden relative py-4 mask-gradient">
            <div ref={marqueeRef} className="flex items-center gap-16 whitespace-nowrap min-w-max select-none">
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">OPENAI</span>
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">FIGMA</span>
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">VERCEL</span>
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">RIOT GAMES</span>
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">DISCORD</span>
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">SPOTIFY</span>
              <span className="text-xl font-bold tracking-tight text-muted-foreground/50">TOYOTA</span>
            </div>
          </div>
        </div>

        {/* Customer Quotes */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Loved by thousands of creators.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              See how teams are optimizing their collaboration using RTX Notion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Quote 1 */}
            <div className="bg-card border border-border/60 p-6 rounded-2xl shadow-sm relative space-y-4">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-muted-foreground/15" />
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                &quot;RTX Notion transformed how our engineering team writes code guidelines and plans product roadmaps. The real-time sync is incredibly fast and reliable.&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs select-none">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">John Doe</h4>
                  <p className="text-[10px] text-muted-foreground">Engineering Manager, Vercel</p>
                </div>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="bg-card border border-border/60 p-6 rounded-2xl shadow-sm relative space-y-4">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-muted-foreground/15" />
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                &quot;The slash commands and integrated task tracker made writing design specifications a breeze. It feels exactly like the premium tools we love, but completely self-hosted.&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-xs select-none">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Alice Smith</h4>
                  <p className="text-[10px] text-muted-foreground">Lead Product Designer, Figma</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
