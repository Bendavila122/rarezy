import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { SIZE } from "@/lib/game2048";
import { useElementSize } from "@/lib/useElementSize";
import { useMergeSim } from "@/lib/useMergeSim";
import { themeFor } from "@/lib/watchTiles";

const GAP_PX = 6;
const BOARD_PAD_PX = 6;
const TILE_TRANSITION = { type: "tween", duration: 0.14, ease: [0.22, 1, 0.36, 1] } as const;

function MiniTile({ value }: { value: number }) {
  const theme = themeFor(value);
  return (
    <div className="flex h-full w-full items-center justify-center rounded-none p-1" style={{ background: theme.bg }}>
      {theme.logo ? (
        <div className="flex h-[70%] w-[80%] items-center justify-center rounded-none bg-white p-0.5">
          <img src={theme.logo} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <Sparkles className="h-3.5 w-3.5" style={{ color: theme.badge }} strokeWidth={2} />
      )}
    </div>
  );
}

/**
 * A non-interactive, auto-looping preview of the exact merge mechanic — the
 * same engine, brand tiles, and slide-then-merge animation as SkillGame
 * itself (via the shared `useMergeSim` hook), so a visitor can watch tiles
 * actually slide together and merge before touching anything. Standing in
 * for an actual demo video: real product visuals, always up to date, no
 * video file to host.
 */
export function GamePreview() {
  const [boardRef, boardSize] = useElementSize<HTMLDivElement>();
  const { tiles, score } = useMergeSim();

  const cellSize = boardSize > 0 ? (boardSize - BOARD_PAD_PX * 2 - GAP_PX * (SIZE - 1)) / SIZE : 0;
  const posFor = (i: number) => BOARD_PAD_PX + i * (cellSize + GAP_PX);

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">Watch it play</p>
        <p className="tabular text-[0.7rem] font-semibold text-white/50">
          Score <span className="text-white">{score}</span>
        </p>
      </div>
      <div ref={boardRef} className="relative mx-auto mt-2 aspect-square w-full max-w-[19rem] rounded-none bg-white/[0.04]">
        {cellSize > 0 && (
          <>
            {Array.from({ length: SIZE * SIZE }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 top-0 rounded-none bg-white/[0.08]"
                style={{
                  width: cellSize,
                  height: cellSize,
                  transform: `translate(${posFor(i % SIZE)}px, ${posFor(Math.floor(i / SIZE))}px)`,
                }}
              />
            ))}

            <AnimatePresence>
              {tiles.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ x: posFor(t.c), y: posFor(t.r), scale: 0.5 }}
                  animate={{ x: posFor(t.c), y: posFor(t.r), scale: 1 }}
                  exit={{ transition: { duration: 0 } }}
                  transition={TILE_TRANSITION}
                  className="absolute left-0 top-0"
                  style={{ width: cellSize, height: cellSize }}
                >
                  <MiniTile value={t.value} />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
