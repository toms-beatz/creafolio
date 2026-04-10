'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, Loader2, X, FolderOpen, HardDrive, Pencil, Check } from 'lucide-react';
import { getStorageUsage, type StorageFile } from '@/features/media/actions';

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${bytes} o`;
}

interface ImageUploaderProps {
    currentUrl?: string;
    portfolioId?: string; // kept for backwards-compat, not used in upload
    label?: string;
    className?: string;
    onUpload: (url: string) => void;
    onClear?: () => void;
}

/**
 * Composant d'upload d'image standalone — sans dépendance Craft.js.
 * Upload vers /api/upload, appelle onUpload(url) avec l'URL résultante.
 * EPIC-14
 */
export function ImageUploader({
    currentUrl,
    portfolioId: _portfolioId,
    label = 'Image',
    className = '',
    onUpload,
    onClear,
}: ImageUploaderProps) {
    const [_uploading] = useState(false);
    const [_error] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<StorageFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [quota, setQuota] = useState<{ total: number; used: number } | null>(null);
    const [sheetUploading, setSheetUploading] = useState(false);
    const [sheetError, setSheetError] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [renameSaving, setRenameSaving] = useState(false);
    const sheetInputRef = useRef<HTMLInputElement>(null);

    const openMediaSheet = useCallback(async () => {
        setSheetOpen(true);
        if (mediaFiles.length === 0) {
            setLoadingMedia(true);
            try {
                const usage = await getStorageUsage();
                setMediaFiles(usage.files.filter((f) => f.mimeType?.startsWith('image/')));
                setQuota({ total: usage.quota, used: usage.totalBytes });
            } finally {
                setLoadingMedia(false);
            }
        }
    }, [mediaFiles.length]);

    const handleSheetUpload = useCallback(async (file: File) => {
        setSheetError(null);
        setSheetUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = (await res.json()) as { url?: string; key?: string; error?: string };
            if (!res.ok || !json.url || !json.key) {
                setSheetError(json.error ?? 'Erreur upload.');
            } else {
                const newFile: StorageFile = {
                    id: crypto.randomUUID(),
                    fileKey: json.key,
                    url: json.url,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    portfolioId: null,
                    displayName: null,
                    createdAt: new Date().toISOString(),
                };
                setMediaFiles((prev) => [newFile, ...prev]);
                setQuota((prev) =>
                    prev ? { ...prev, used: prev.used + file.size } : null,
                );
            }
        } catch {
            setSheetError('Erreur réseau.');
        } finally {
            setSheetUploading(false);
            if (sheetInputRef.current) sheetInputRef.current.value = '';
        }
    }, []);

    const confirmRename = useCallback(async (fileKey: string) => {
        const name = renameValue.trim();
        if (!name) { setRenaming(null); return; }
        setRenameSaving(true);
        try {
            const res = await fetch('/api/media', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileKey, displayName: name }),
            });
            if (!res.ok) {
                const json = (await res.json()) as { error?: string };
                setSheetError(json.error ?? 'Erreur lors du renommage.');
            } else {
                setMediaFiles((prev) =>
                    prev.map((f) => f.fileKey === fileKey ? { ...f, displayName: name } : f),
                );
            }
        } catch {
            setSheetError('Erreur réseau.');
        } finally {
            setRenameSaving(false);
            setRenaming(null);
        }
    }, [renameValue]);

    return (
        <div className={`relative ${className}`}>
            {currentUrl && !_uploading && (
                <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentUrl} alt={label} className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                        <button
                            type="button"
                            onClick={() => void openMediaSheet()}
                            className="rounded-lg bg-zinc-50/90 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                        >
                            Changer
                        </button>
                        {onClear && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="rounded-lg bg-red-500/90 p-1.5 text-white hover:bg-red-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {(!currentUrl || _uploading) && (
                <button
                    type="button"
                    onClick={() => !_uploading && void openMediaSheet()}
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 hover:border-sky-400/50 hover:bg-zinc-800 transition-colors p-4"
                >
                    {_uploading ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                            <p className="text-xs text-zinc-400">Upload en cours…</p>
                        </>
                    ) : (
                        <>
                            <FolderOpen className="h-5 w-5 text-zinc-500" />
                            <p className="text-xs text-zinc-400 text-center">{label}</p>
                            <p className="text-[10px] text-zinc-600">Ouvrir la médiathèque</p>
                        </>
                    )}
                </button>
            )}

            {_error && <p className="mt-1 text-xs text-red-400">{_error}</p>}

            {/* Media library modal */}
            {sheetOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-end bg-zinc-950/70 backdrop-blur-sm" onClick={() => setSheetOpen(false)}>
                    <div
                        className="flex h-full w-full max-w-sm flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-dashed border-zinc-800 shrink-0">
                            <p className="text-sm font-semibold text-white">Médiathèque</p>
                            <button
                                type="button"
                                onClick={() => setSheetOpen(false)}
                                className="rounded-lg p-1 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Upload zone */}
                        <div className="shrink-0 px-4 pt-3 pb-2 border-b border-dashed border-zinc-800">
                            <div
                                onClick={() => !sheetUploading && sheetInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void handleSheetUpload(f); }}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 py-3 hover:border-sky-400/50 hover:bg-zinc-900 transition-colors"
                            >
                                {sheetUploading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin text-sky-400" /><span className="text-xs text-zinc-400">Upload…</span></>
                                ) : (
                                    <><Upload className="h-4 w-4 text-zinc-500" /><span className="text-xs text-zinc-400">Ajouter une image</span></>
                                )}
                            </div>
                            {sheetError && <p className="mt-1 text-[11px] text-red-400">{sheetError}</p>}
                            <input
                                ref={sheetInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleSheetUpload(f); }}
                            />
                        </div>

                        {/* Grid */}
                        <div className="overflow-y-auto flex-1 p-4">
                            {loadingMedia ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                                </div>
                            ) : mediaFiles.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-12 text-center">
                                    <FolderOpen className="h-8 w-8 text-zinc-700" />
                                    <p className="text-xs text-zinc-600">Aucune image uploadée</p>
                                    <p className="text-[10px] text-zinc-700">Utilise la zone ci-dessus pour en ajouter.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {mediaFiles.map((file) => (
                                        <div key={file.id} className="flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onUpload(file.url);
                                                    setSheetOpen(false);
                                                }}
                                                className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-zinc-800 hover:border-sky-400/50 transition-colors"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={file.url}
                                                    alt={file.displayName ?? file.fileName}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-sky-400/0 group-hover:bg-sky-400/10 transition-colors rounded-lg" />
                                            </button>
                                            {/* Rename row */}
                                            {renaming === file.fileKey ? (
                                                <form
                                                    onSubmit={(e) => { e.preventDefault(); void confirmRename(file.fileKey); }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <input
                                                        autoFocus
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Escape') setRenaming(null); }}
                                                        className="flex-1 min-w-0 rounded bg-zinc-800 border border-sky-400/50 px-1.5 py-0.5 text-[10px] text-white font-mono outline-none"
                                                    />
                                                    <button type="submit" disabled={renameSaving} className="text-sky-400 hover:text-sky-300 shrink-0">
                                                        {renameSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                    </button>
                                                    <button type="button" onClick={() => setRenaming(null)} className="text-zinc-500 hover:text-zinc-300 shrink-0">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="flex items-center gap-1 px-0.5">
                                                    <span className="flex-1 truncate text-[10px] text-zinc-500 font-mono min-w-0">
                                                        {file.displayName ?? file.fileName}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setRenaming(file.fileKey); setRenameValue(file.displayName ?? file.fileName); }}
                                                        className="shrink-0 text-zinc-700 hover:text-sky-400 transition-colors"
                                                        title="Renommer"
                                                    >
                                                        <Pencil className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quota bar */}
                        {quota && (
                            <div className="shrink-0 border-t border-dashed border-zinc-800 px-4 py-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                        <HardDrive className="h-3 w-3" />
                                        Stockage
                                    </div>
                                    <span className="text-[10px] text-zinc-500">
                                        {formatBytes(quota.used)} / {formatBytes(quota.total)}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${quota.used / quota.total >= 0.9 ? 'bg-red-500' :
                                            quota.used / quota.total >= 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(100, (quota.used / quota.total) * 100)}%`, minWidth: quota.used > 0 ? '3px' : '0' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
