import { useSyncExternalStore } from "react";

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
