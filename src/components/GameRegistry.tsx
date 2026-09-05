import type { ComponentType } from "react";
import { type GameId, gameById } from "@/lib/games";
import { SkillGame } from "@/components/SkillGame";
import { GamePreview } from "@/components/GamePreview";
import { ReflexGame } from "@/components/ReflexGame";
import { ReflexPreview } from "@/components/ReflexPreview";
import { PrecisionGame } from "@/components/PrecisionGame";
import { PrecisionPreview } from "@/components/PrecisionPreview";
import { MemoryGame } from "@/components/MemoryGame";
import { MemoryPreview } from "@/components/MemoryPreview";
import { HuntGame } from "@/components/HuntGame";
import { HuntPreview } from "@/components/HuntPreview";

type GameModule = {
  Play: ComponentType<{ onComplete: (score: number) => void }>;
  Preview: ComponentType;
};

/** Wires each catalog entry in `@/lib/games` to its real components — kept separate from that file since `lib` stays JSX-free. */
const GAME_COMPONENTS: Record<GameId, GameModule> = {
  merge: { Play: SkillGame, Preview: GamePreview },
  reflex: { Play: ReflexGame, Preview: ReflexPreview },
  precision: { Play: PrecisionGame, Preview: PrecisionPreview },
  memory: { Play: MemoryGame, Preview: MemoryPreview },
  hunt: { Play: HuntGame, Preview: HuntPreview },
};

export function gameModule(id: GameId | string | undefined): GameModule {
  return GAME_COMPONENTS[gameById(id).id];
}
