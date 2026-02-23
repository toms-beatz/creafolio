'use client';

import { useCallback } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   RenderNode — wrapper Elementor-style autour de chaque bloc CraftJS.
   Utilisé via le prop `onRender` de <Editor>.

   Quand un bloc est sélectionné :
   - Indicateur de couleur en haut à gauche (sky badge)
   - Boutons inline : ↑ Monter / ↓ Descendre / 🗑️ Supprimer
   Quand un bloc est survolé (non sélectionné) :
   - Outline subtil pour indiquer l'interactivité
──────────────────────────────────────────────────────────────────────────── */

interface RenderNodeProps {
    render: React.ReactElement;
}

export function RenderNode({ render }: RenderNodeProps) {
    const { id } = useNode();
    const { isSelected, isHovered } = useNode((node) => ({
        isSelected: node.events.selected,
        isHovered: node.events.hovered,
    }));
    const { actions: editorActions, query } = useEditor();

    const getInfo = useCallback(() => {
        try {
            const node = query.node(id).get();
            const parentId = node.data.parent as string | null;
            if (!parentId) return null;
            const parent = query.node(parentId).get();
            const siblings = parent.data.nodes as string[];
            const index = siblings.indexOf(id);
            return { parentId, index, count: siblings.length };
        } catch {
            return null;
        }
    }, [id, query]);

    /* ROOT ne doit jamais recevoir de wrapper */
    if (id === 'ROOT') return render;

    const info = getInfo();
    const canUp = info ? info.index > 0 : false;
    const canDown = info ? info.index < info.count - 1 : false;

    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (info && canUp) {
            editorActions.move(id, info.parentId, info.index - 1);
        }
    };

    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (info && canDown) {
            /* index + 2 car après suppression du nœud, le suivant remonte d'une position */
            editorActions.move(id, info.parentId, info.index + 2);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        editorActions.delete(id);
    };

    return (
        <div className="group/rn relative">
            {/* ── Outline hover (ne s'affiche que si non sélectionné) ── */}
            {isHovered && !isSelected && (
                <div className="pointer-events-none absolute inset-0 z-[8] ring-1 ring-inset ring-sky-400/40" />
            )}

            {/* ── Toolbar badge sur le bloc sélectionné ─────────────── */}
            {isSelected && (
                <>
                    {/* Bordure de sélection bleue */}
                    <div className="pointer-events-none absolute inset-0 z-[8] ring-2 ring-inset ring-sky-500" />

                    {/* Mini-toolbar en haut à droite (style Elementor) */}
                    <div
                        className="absolute right-0 top-0 z-[20] flex items-center rounded-bl-lg bg-sky-500 pointer-events-auto"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Monter */}
                        <button
                            title="Monter le bloc"
                            disabled={!canUp}
                            onClick={handleMoveUp}
                            className="flex h-6 w-6 items-center justify-center text-white/80 hover:bg-sky-600 disabled:opacity-30 transition-colors"
                        >
                            <ChevronUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Descendre */}
                        <button
                            title="Descendre le bloc"
                            disabled={!canDown}
                            onClick={handleMoveDown}
                            className="flex h-6 w-6 items-center justify-center text-white/80 hover:bg-sky-600 disabled:opacity-30 transition-colors"
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Séparateur */}
                        <div className="mx-0.5 h-3.5 w-px bg-sky-400/50" />

                        {/* Supprimer */}
                        <button
                            title="Supprimer le bloc"
                            onClick={handleDelete}
                            className="flex h-6 w-6 items-center justify-center text-white/80 hover:bg-red-500 transition-colors"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                </>
            )}

            {render}
        </div>
    );
}
