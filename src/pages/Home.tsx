import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRarezy } from "@/lib/store";
import { type GameId, gameById } from "@/lib/games";
import { gameModule } from "@/components/GameRegistry";
import { FaqSection } from "@/components/FaqSection";
import { ScrollStory } from "@/components/ScrollStory";
import { GameSection } from "@/components/GameSection";
import { EndingSoonSection } from "@/components/EndingSoonSection";
import { HowToWinSection } from "@/components/HowToWinSection";
import { LiveStatsBand } from "@/components/LiveStatsBand";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TravelAdsSection } from "@/components/TravelAdsSection";

export function Home() {
  const { currentUser } = useRarezy();
  const [playingGame, setPlayingGame] = useState<GameId | null>(null);
  const [result, setResult] = useState<{ gameId: GameId; score: number } | null>(null);

  // Section-by-section snap scrolling is home-only — toggle it on <html>
  // for exactly as long as this page is mounted so other routes keep
  // normal free scrolling.
  useEffect(() => {
    document.documentElement.classList.add("snap-page");
    return () => document.documentElement.classList.remove("snap-page");
  }, []);

  // The home page is guest-only marketing ground now — a signed-in buyer
  // opens straight onto Browse instead (admin/seller accounts never reach
  // here at all, already redirected by their own gates).
  if (currentUser && !currentUser.isAdmin && !currentUser.isSeller) {
    return <Navigate to="/browse" replace />;
  }

  return (
    <>
      {/* Only the hero story's two stops (buyers, marketplace) snap —
          everything after it, starting with what's ending soon, scrolls
          normally like an ordinary page. */}
      <div id="scroll-story">
        <ScrollStory />
      </div>
      <EndingSoonSection />
      <HowToWinSection />
      <div id="game-section" className="scroll-mt-16">
        <GameSection
          result={result}
          onTry={(id) => {
            setResult(null);
            setPlayingGame(id);
          }}
        />
      </div>
      <LiveStatsBand />
      <ReviewsSection />
      <FaqSection />
      <TravelAdsSection />

      {playingGame &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onClick={() => setPlayingGame(null)}
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
                onClick={() => setPlayingGame(null)}
                aria-label="Close"
                className="press absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-none bg-white/10 text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
              <p className="text-center text-[0.62rem] uppercase tracking-[0.24em] text-muted">
                Try before you buy — {gameById(playingGame).name}
              </p>
              {(() => {
                const { Play } = gameModule(playingGame);
                return (
                  <Play
                    onComplete={(s) => {
                      setResult({ gameId: playingGame, score: s });
                      setPlayingGame(null);
                    }}
                  />
                );
              })()}
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
