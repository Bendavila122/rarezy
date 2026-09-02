import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { FaqSection } from "@/components/FaqSection";
import { SearchHero } from "@/components/SearchHero";
import { ScrollStory } from "@/components/ScrollStory";
import { GameSection } from "@/components/GameSection";
import { WhyRarezySection } from "@/components/WhyRarezySection";
import { EndingSoonSection } from "@/components/EndingSoonSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { AffiliateStrip } from "@/components/AffiliateStrip";
import { SkillGame } from "@/components/SkillGame";
import { ScrollHint } from "@/components/ScrollHint";

export function Home() {
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [heroScore, setHeroScore] = useState<number | null>(null);

  // Section-by-section snap scrolling is home-only — toggle it on <html>
  // for exactly as long as this page is mounted so other routes keep
  // normal free scrolling.
  useEffect(() => {
    document.documentElement.classList.add("snap-page");
    return () => document.documentElement.classList.remove("snap-page");
  }, []);

  return (
    <>
      {/* Search bar plus the three-stop story (buyers, sellers, marketplace)
          together fill exactly one screen below the sticky nav — nothing of
          "Why Rarezy" is visible until the story's finished — followed by
          the game itself given room to breathe, then social proof, partner
          services, and FAQs before the footer. Every section below is its
          own snap point. */}
      <div className="flex min-h-[calc(100vh-4rem)] snap-start scroll-mt-16 flex-col">
        <SearchHero />
        <ScrollStory />
      </div>
      <div className="snap-start scroll-mt-16">
        <WhyRarezySection />
      </div>
      <div className="snap-start scroll-mt-16">
        <GameSection
          score={heroScore}
          onTry={() => setHeroPlaying(true)}
          onPlayAgain={() => {
            setHeroScore(null);
            setHeroPlaying(true);
          }}
        />
      </div>
      <div className="snap-start scroll-mt-16">
        <EndingSoonSection />
      </div>
      <div className="snap-start scroll-mt-16">
        <ReviewsSection />
      </div>
      <div className="snap-start scroll-mt-16">
        <FaqSection />
      </div>
      <div className="snap-start scroll-mt-16">
        <AffiliateStrip />
      </div>
      <ScrollHint />

      {heroPlaying &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onClick={() => setHeroPlaying(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark relative w-full max-w-2xl rounded-none p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setHeroPlaying(false)}
                aria-label="Close"
                className="press absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-none bg-white/10 text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
              <p className="text-center text-[0.62rem] uppercase tracking-[0.24em] text-muted">Try before you buy</p>
              <SkillGame
                onComplete={(s) => {
                  setHeroScore(s);
                  setHeroPlaying(false);
                }}
              />
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
