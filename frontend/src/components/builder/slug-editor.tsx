'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Pencil, Loader2, AlertCircle, Link } from 'lucide-react';

interface SlugEditorProps {
    portfolioId: string;
    initialSlug: string;
    onSaved: (newSlug: string) => void;
}

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function SlugEditor({ portfolioId, initialSlug, onSaved }: SlugEditorProps) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(initialSlug);
    const [checkState, setCheckState] = useState<CheckState>('idle');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const checkSlug = useCallback(async (slug: string) => {
        if (!slug || slug === initialSlug) { setCheckState('idle'); return; }
        const valid = /^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/.test(slug);
        if (!valid) { setCheckState('invalid'); return; }
        setCheckState('checking');
        try {
            // Client-side fetch (not server action) — no cookie needed for GET
            const res = await fetch(
                `/api/slug-check?slug=${encodeURIComponent(slug)}&portfolio_id=${portfolioId}`,
            );
            const data = (await res.json()) as { available: boolean };
            setCheckState(data.available ? 'available' : 'taken');
        } catch {
            setCheckState('idle');
        }
    }, [portfolioId, initialSlug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = slugify(e.target.value);
        setValue(raw);
        setCheckState('idle');
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => checkSlug(raw), 400);
    };

    const handleSave = async () => {
        if (checkState === 'taken' || checkState === 'invalid') return;
        if (value === initialSlug) { setEditing(false); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/portfolio-slug`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portfolioId, slug: value }),
            });
            if (!res.ok) {
                setCheckState('taken');
                return;
            }
            onSaved(value);
            setEditing(false);
        } catch {
            setCheckState('taken');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setValue(initialSlug);
        setCheckState('idle');
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    if (!editing) {
        return (
            <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors group"
                title="Modifier le slug (URL)"
            >
                <Link className="h-3 w-3" />
                <span className="font-mono">{initialSlug}</span>
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <Link className="h-3 w-3 text-zinc-500 shrink-0" />
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className={`h-6 rounded-md border bg-zinc-900 px-2 font-mono text-xs text-white outline-none transition-colors w-40 ${checkState === 'available'
                        ? 'border-emerald-500/60'
                        : checkState === 'taken' || checkState === 'invalid'
                            ? 'border-red-500/60'
                            : 'border-zinc-700 focus:border-zinc-500'
                        }`}
                    placeholder="mon-portfolio"
                    autoComplete="off"
                    spellCheck={false}
                />
                <span className="absolute right-1.5 flex">
                    {checkState === 'checking' && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
                    {checkState === 'available' && <Check className="h-3 w-3 text-emerald-400" />}
                    {(checkState === 'taken' || checkState === 'invalid') && <AlertCircle className="h-3 w-3 text-red-400" />}
                </span>
            </div>
            {checkState === 'invalid' && (
                <span className="text-[10px] text-red-400">lettres, chiffres, tirets</span>
            )}
            {checkState === 'taken' && (
                <span className="text-[10px] text-red-400">déjà utilisé</span>
            )}
            <button
                onClick={handleSave}
                disabled={saving || checkState === 'taken' || checkState === 'invalid' || checkState === 'checking'}
                className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Confirmer"
            >
                {saving ? <Loader2 className="h-3 w-3 animate-spin text-white" /> : <Check className="h-3 w-3 text-white" />}
            </button>
            <button
                onClick={handleCancel}
                className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
                title="Annuler"
            >
                <X className="h-3 w-3 text-zinc-300" />
            </button>
        </div>
    );
}
