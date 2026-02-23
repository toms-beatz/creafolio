'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, Loader2, X, ImageIcon } from 'lucide-react';
import { useNode } from '@craftjs/core';

interface ImageUploaderProps {
    propKey: string;
    currentUrl?: string;
    portfolioId: string;
    label?: string;
    className?: string;
}

/**
 * Composant d'upload d'image dans le builder.
 * Upload vers R2 via /api/upload, met à jour la prop Craft.js via setProp.
 * EPIC 16 — US-1603
 */
export function ImageUploader({
    propKey,
    currentUrl,
    portfolioId,
    label = 'Image',
    className = '',
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        isSelected,
        actions: { setProp },
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));

    const handleFile = useCallback(
        async (file: File) => {
            setError(null);
            setUploading(true);

            const fd = new FormData();
            fd.append('file', file);
            fd.append('portfolioId', portfolioId);

            try {
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const json = (await res.json()) as { url?: string; error?: string };

                if (!res.ok || !json.url) {
                    setError(json.error ?? 'Erreur upload.');
                } else {
                    setProp((props: Record<string, unknown>) => {
                        props[propKey] = json.url;
                    });
                }
            } catch {
                setError('Erreur réseau.');
            } finally {
                setUploading(false);
            }
        },
        [portfolioId, propKey, setProp],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
        },
        [handleFile],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) void handleFile(file);
        },
        [handleFile],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setProp((props: Record<string, unknown>) => {
                props[propKey] = '';
            });
        },
        [propKey, setProp],
    );

    if (!isSelected && currentUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={currentUrl}
                alt={label}
                className={`object-cover ${className}`}
                draggable={false}
            />
        );
    }

    if (!isSelected) {
        return (
            <div className={`flex items-center justify-center bg-zinc-800/50 ${className}`}>
                <ImageIcon className="h-6 w-6 text-zinc-600" />
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Aperçu actuel */}
            {currentUrl && !uploading && (
                <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentUrl} alt={label} className={`object-cover w-full h-full ${className}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white"
                        >
                            Changer
                        </button>
                        <button
                            onClick={handleClear}
                            className="rounded-lg bg-red-500/90 p-1.5 text-white hover:bg-red-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Zone de drop / bouton upload */}
            {(!currentUrl || uploading) && (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 hover:border-sky-400/50 hover:bg-zinc-800 transition-colors p-4"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                            <p className="text-xs text-zinc-400">Upload en cours…</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-zinc-500" />
                            <p className="text-xs text-zinc-400 text-center">
                                Glisser une image<br />
                                <span className="text-sky-400">ou cliquer</span>
                            </p>
                            <p className="text-[10px] text-zinc-600">JPG, PNG, WebP — 5 Mo max</p>
                        </>
                    )}
                </div>
            )}

            {/* Erreur */}
            {error && (
                <p className="mt-1 text-[10px] text-red-400">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
