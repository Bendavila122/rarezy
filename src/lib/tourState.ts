import { useSyncExternalStore } from "react";

/** Shared `layoutId` for the buyer hero's phone mockup — the same DOM element hands off between the hero and the tour overlay via Framer's automatic layout animation, rather than the tour spawning a lookalike second phone. */
export const TOUR_PHONE_LAYOUT_ID = "buyer-phone-shared";

/**
 * Whether the "What do we actually do?" explainer tour is open — a single
 * global flag so the trigger button (in the hero) and the full-screen
 * overlay (portalled from Home) don't need to share a parent component,
 * same pattern as `authGate.ts`.
 */
let snapshot = { open: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useTourState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot,
  );
}

export const tourState = {
  open() {
    snapshot = { open: true };
    emit();
  },
  close() {
    snapshot = { open: false };
    emit();
  },
};
