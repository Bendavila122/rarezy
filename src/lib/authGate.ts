import { useSyncExternalStore } from "react";

/**
 * Guests can browse the whole marketplace freely. This is the single choke
 * point every buy/sell/account action calls through — it never blocks
 * navigation, it just asks a guest to create a free account before the
 * action itself runs. UI-only, so it isn't persisted like `store.ts`.
 */
let snapshot = { open: false, reason: "" };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useAuthGate() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot,
  );
}

export const authGate = {
  request(forReason: string) {
    snapshot = { open: true, reason: forReason };
    emit();
  },
  dismiss() {
    snapshot = { ...snapshot, open: false };
    emit();
  },
};
