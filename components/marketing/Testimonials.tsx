"use client";

// components/marketing/Testimonials.tsx
// Notion-style customer wall of love and impact metrics.

import { Star, Quote, Award, ShieldCheck, Zap } from "lucide-react";

export function Testimonials() {
  return (
    <section id="testimonials" className="w-full bg-background py-20 px-6 border-t border-border/30">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Star className="h-3.5 w-3.5 fill-amber-400" /> Rated 4.9/5 by 10,000+ Teams
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Loved by builders worldwide.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            See how product managers, engineers, and creators streamline their workflows with Voltaic.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card border border-border/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                &quot;Voltaic completely replaced Notion and Jira for our 40-person engineering team. The real-time document editing with live cursors is fast and buttery smooth.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                JD
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">John Doe</h4>
                <p className="text-[11px] text-muted-foreground">Engineering Lead at Vercel</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                &quot;Having Voltaic AI search our entire wiki saves our product team at least 8 hours every single week. It instantly answers questions from our docs.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="w-9 h-9 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-xs">
                AS
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Alice Smith</h4>
                <p className="text-[11px] text-muted-foreground">Lead Designer at Figma</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                &quot;The slash commands, nested wikis, and multi-column drag and drop make drafting specifications effortless. Absolutely essential for startups.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                MK
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Marcus Chen</h4>
                <p className="text-[11px] text-muted-foreground">Founder & CEO at LaunchPad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Callouts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-border/40 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-black text-foreground">10M+</div>
            <div className="text-xs text-muted-foreground font-medium">Docs & Pages Created</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-foreground">99.99%</div>
            <div className="text-xs text-muted-foreground font-medium">Sync Server Uptime</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-foreground">150+</div>
            <div className="text-xs text-muted-foreground font-medium">Countries Active</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-foreground">50k+</div>
            <div className="text-xs text-muted-foreground font-medium">AI Queries Daily</div>
          </div>
        </div>

      </div>
    </section>
  );
}
