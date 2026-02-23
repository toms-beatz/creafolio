"use client";

import { useRef, useCallback } from "react";
import { saveCraftState } from "@/features/builder/actions";
import type { Json } from "@/types/database";

const AUTOSAVE_DELAY = 2000; // 2s debounce — US-205 CA-1
const MIN_SAVE_INTERVAL = 6000; // max ~10 saves/min — US-205 CA-6

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

/**
 * Hook autosave découplé de l'Editor Craft.js.
 * - onNodesChange  → passer à <Editor onNodesChange={...}>
 * - saveNowWithQuery(query) → sauvegarde manuelle immédiate
 * US-205
 */
export function useAutosave(
  portfolioId: string,
  onStatusChange: (status: SaveStatus) => void,
) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveAt = useRef(0);

  const doSave = useCallback(
    async (serialized: string) => {
      const now = Date.now();
      if (now - lastSaveAt.current < MIN_SAVE_INTERVAL) return;
      lastSaveAt.current = now;

      onStatusChange("saving");

      // Backup localStorage — US-205 CA-4
      try {
        localStorage.setItem(
          `blooprint_draft_${portfolioId}`,
          JSON.stringify({
            state: serialized,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        /* private mode */
      }

      // query.serialize() retourne une string JSON — on parse en objet
      // pour que Supabase stocke un jsonb object (pas une string).
      let craftObj: Json;
      try {
        craftObj = JSON.parse(serialized) as Json;
      } catch {
        console.error("[autosave] Invalid JSON from serialize()");
        onStatusChange("error");
        return;
      }

      const { error } = await saveCraftState(portfolioId, craftObj);

      if (error) {
        console.error("[autosave] Supabase error:", error);
        onStatusChange("error");
      } else {
        onStatusChange("saved");
        try {
          const raw = localStorage.getItem(`blooprint_draft_${portfolioId}`);
          if (raw) {
            const parsed = JSON.parse(raw) as object;
            localStorage.setItem(
              `blooprint_draft_${portfolioId}`,
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

  /** Passé à <Editor onNodesChange={...}> — déclenche le debounce */
  const onNodesChange = useCallback(
    (query: { serialize: () => string }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      onStatusChange("unsaved");
      debounceTimer.current = setTimeout(() => {
        void doSave(query.serialize());
      }, AUTOSAVE_DELAY);
    },
    [doSave, onStatusChange],
  );

  /** Sauvegarde immédiate depuis BuilderInner (bouton "Sauvegarder") */
  const saveNowWithQuery = useCallback(
    async (query: { serialize: () => string }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      await doSave(query.serialize());
    },
    [doSave],
  );

  return { onNodesChange, saveNowWithQuery };
}

/**
 * Vérifie si un brouillon localStorage plus récent qu'un timestamp Supabase existe.
 * Retourne le state JSON si oui, null sinon. — US-205 CA-5
 */
export function checkLocalDraft(
  portfolioId: string,
  supabaseUpdatedAt: string,
): string | null {
  try {
    const raw = localStorage.getItem(`blooprint_draft_${portfolioId}`);
    if (!raw) return null;
    const { state, savedAt, synced } = JSON.parse(raw) as {
      state: string;
      savedAt: string;
      synced?: boolean;
    };
    if (synced) return null; // déjà synchronisé
    if (new Date(savedAt) > new Date(supabaseUpdatedAt)) return state;
    return null;
  } catch {
    return null;
  }
}
