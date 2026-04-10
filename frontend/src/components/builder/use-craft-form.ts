"use client";

import { useState, useCallback } from "react";
import { generateDefaultTemplate } from "@/lib/default-template";
import type { CraftNodes } from "@/components/portfolio/static-renderer";

/** IDs fixes du template — stables dans craft_state */
export const TMPL = {
  HERO: "tmpl_hero",
  ABOUT: "tmpl_about",
  STATS: "tmpl_stats",
  GALLERY: "tmpl_gallery",
  CONTACT: "tmpl_contact",
  FOOTER: "tmpl_footer",
} as const;

/**
 * Mutation immuable d'un nœud dans craft_state.
 * Ne touche qu'aux props du nœud ciblé.
 */
export function updateCraftNode(
  state: CraftNodes,
  nodeId: string,
  newProps: Record<string, unknown>,
): CraftNodes {
  const node = state[nodeId];
  if (!node) return state;
  return {
    ...state,
    [nodeId]: {
      ...node,
      props: { ...node.props, ...newProps },
    },
  };
}

/**
 * Hook central du Form Editor.
 * Gère le craftState local et expose des setters par section.
 * Retourne aussi le craftState sérialisé pour l'autosave.
 */
export function useCraftForm(initial: CraftNodes) {
  const [craftState, setCraftState] = useState<CraftNodes>(initial);

  const updateSection = useCallback(
    (nodeId: string, newProps: Record<string, unknown>) => {
      setCraftState((prev) => updateCraftNode(prev, nodeId, newProps));
    },
    [],
  );

  const updateHero = useCallback(
    (props: Record<string, unknown>) => updateSection(TMPL.HERO, props),
    [updateSection],
  );

  const updateAbout = useCallback(
    (props: Record<string, unknown>) => updateSection(TMPL.ABOUT, props),
    [updateSection],
  );

  const updateStats = useCallback(
    (props: Record<string, unknown>) => updateSection(TMPL.STATS, props),
    [updateSection],
  );

  const updateGallery = useCallback(
    (props: Record<string, unknown>) => updateSection(TMPL.GALLERY, props),
    [updateSection],
  );

  const updateContact = useCallback(
    (props: Record<string, unknown>) => updateSection(TMPL.CONTACT, props),
    [updateSection],
  );

  const updateFooter = useCallback(
    (props: Record<string, unknown>) => updateSection(TMPL.FOOTER, props),
    [updateSection],
  );

  return {
    craftState,
    updateHero,
    updateAbout,
    updateStats,
    updateGallery,
    updateContact,
    updateFooter,
  };
}

/** Maps resolvedName → fixed TMPL ID, for migrating old portfolios with random UUIDs */
const TYPE_TO_TMPL: Record<string, string> = {
  HeroBlock: "tmpl_hero",
  AboutBlock: "tmpl_about",
  StatsBlock: "tmpl_stats",
  GalleryBlock: "tmpl_gallery",
  ContactBlock: "tmpl_contact",
  FooterBlock: "tmpl_footer",
};

/**
 * Migre un craft state avec des IDs aléatoires vers les IDs fixes du TMPL.
 * Nécessaire pour les portfolios créés avant l'introduction des IDs fixes.
 */
function migrateToFixedIds(state: CraftNodes): CraftNodes {
  // Si les IDs fixes sont déjà présents, pas de migration nécessaire
  if (state[TMPL.HERO]) return state;

  const idMap: Record<string, string> = {};
  for (const [id, node] of Object.entries(state)) {
    if (id === "ROOT") continue;
    const resolvedName =
      typeof node.type === "string" ? node.type : node.type?.resolvedName;
    const newId = resolvedName ? TYPE_TO_TMPL[resolvedName] : undefined;
    if (newId && newId !== id && !state[newId]) {
      idMap[id] = newId;
    }
  }

  if (Object.keys(idMap).length === 0) return state;

  const result: CraftNodes = {};
  for (const [id, node] of Object.entries(state)) {
    const newId = idMap[id] ?? id;
    result[newId] = {
      ...node,
      nodes: node.nodes.map((childId) => idMap[childId] ?? childId),
      parent: node.parent ? (idMap[node.parent] ?? node.parent) : node.parent,
    };
  }
  return result;
}

/**
 * Ajoute les nœuds TMPL manquants depuis le template par défaut.
 * Utile quand un portfolio existant n'a pas encore certaines sections.
 */
function backfillMissingNodes(state: CraftNodes): CraftNodes {
  const defaults = generateDefaultTemplate() as CraftNodes;
  const defaultOrder = defaults.ROOT?.nodes ?? [];
  const missing = defaultOrder.filter((id) => !state[id] && defaults[id]);
  if (missing.length === 0) return state;

  const result: CraftNodes = { ...state };
  for (const id of missing) {
    result[id] = defaults[id];
  }

  // Reconstruit ROOT.nodes dans l'ordre canonique, en conservant les nœuds extras
  const currentNodes = result.ROOT?.nodes ?? [];
  const allInDefault = new Set(defaultOrder);
  const ordered = defaultOrder.filter((id) => result[id]);
  const extras = currentNodes.filter((id) => !allInDefault.has(id));
  result.ROOT = {
    ...(result.ROOT ?? defaults.ROOT),
    nodes: [...ordered, ...extras],
  };

  return result;
}

/** Initialise un craftState depuis le JSON Supabase ou le template par défaut */
export function initCraftState(craftStateJson: string | null): CraftNodes {
  if (craftStateJson) {
    try {
      const parsed = JSON.parse(craftStateJson) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        "ROOT" in (parsed as object)
      ) {
        const migrated = migrateToFixedIds(parsed as CraftNodes);
        return backfillMissingNodes(migrated);
      }
    } catch {
      /* fallback */
    }
  }
  return generateDefaultTemplate() as CraftNodes;
}
