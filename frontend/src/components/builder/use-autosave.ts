"use client";

import { useRef, useCallback } from "react";
import { saveCraftStateAction } from "@/features/builder/actions";

const AUTOSAVE_DELAY = 1500; // 1.5s debounce — US-1402 CA-4
const MIN_SAVE_INTERVAL = 5000; // max ~12 saves/min

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

/**
 * Hook autosave découplé — accepte un objet craft_state directement.
 * Utilisé par le Form Editor (EPIC-14).
 */
export function useAutosave(
  portfolioId: string,
  onStatusChange: (status: SaveStatus) => void,
) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveAt = useRef(0);

  const doSave = useCallback(
    async (craftState: Record<string, unknown>) => {
      const now = Date.now();
      if (now - lastSaveAt.current < MIN_SAVE_INTERVAL) return;
      lastSaveAt.current = now;

      onStatusChange("saving");

      // Backup localStorage
      try {
        localStorage.setItem(
          `creafolio_draft_${portfolioId}`,
          JSON.stringify({
            state: JSON.stringify(craftState),
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        /* private mode */
      }

      const { error } = await saveCraftStateAction(portfolioId, craftState);

      if (error) {
        console.error("[autosave] save error:", error);
        onStatusChange("error");
      } else {
        onStatusChange("saved");
        try {
          const raw = localStorage.getItem(`creafolio_draft_${portfolioId}`);
          if (raw) {
            const parsed = JSON.parse(raw) as object;
            localStorage.setItem(
              `creafolio_draft_${portfolioId}`,
              JSON.stringify({ ...parsed, synced: true }),
            );
          }
        } catch {
          /* ignore */
        }
      }
    },
    [portfolioId, onStatusChange],
  );

  /** Déclenche le debounce autosave avec le craftState courant */
  const scheduleSave = useCallback(
    (craftState: Record<string, unknown>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      onStatusChange("unsaved");
      debounceTimer.current = setTimeout(() => {
        void doSave(craftState);
      }, AUTOSAVE_DELAY);
    },
    [doSave, onStatusChange],
  );

  /** Sauvegarde immédiate (bouton "Sauvegarder" ou publication) */
  const saveNow = useCallback(
    async (craftState: Record<string, unknown>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      await doSave(craftState);
    },
    [doSave],
  );

  return { scheduleSave, saveNow };
}

/**
 * Vérifie si un brouillon localStorage plus récent qu'un timestamp Supabase existe.
 * Retourne le state JSON si oui, null sinon.
 */
export function checkLocalDraft(
  portfolioId: string,
  dbUpdatedAt: string,
): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(`creafolio_draft_${portfolioId}`);
    if (!raw) return null;
    const { state, savedAt, synced } = JSON.parse(raw) as {
      state: string;
      savedAt: string;
      synced?: boolean;
    };
    if (synced) return null;
    if (new Date(savedAt) > new Date(dbUpdatedAt)) {
      return JSON.parse(state) as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
