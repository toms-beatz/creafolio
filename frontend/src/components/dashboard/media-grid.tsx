'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    Trash2, Image as ImageIcon, AlertTriangle, Upload, Loader2,
    X, ChevronLeft, ChevronRight, Pencil, Check,
} from 'lucide-react';
import type { StorageFile } from '@/features/media/actions';
import { checkFileUsedInPortfolios } from '@/features/media/actions';

interface Portfolio { id: string; title: string }

interface MediaGridProps {
    files: StorageFile[];
    portfolios: Portfolio[];
}

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${Math.round(bytes / 1024)} Ko`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "il y a 1 jour";
    if (days < 30) return `il y a ${days} jours`;
    return `il y a ${Math.floor(days / 30)} mois`;
}

export function MediaGrid({ files: initialFiles, portfolios }: MediaGridProps) {
    const [localFiles, setLocalFiles] = useState<StorageFile[]>(initialFiles);
    const [filter, setFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmFile, setConfirmFile] = useState<StorageFile | null>(null);
    const [usedIn, setUsedIn] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [renaming, setRenaming] = useState<string | null>(null); // fileKey being renamed
    const [renameValue, setRenameValue] = useState('');
    const [renameSaving, setRenameSaving] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const portfoliosWithFiles = portfolios.filter((p) =>
        localFiles.some((f) => f.portfolioId === p.id),
    );

    const filtered = (() => {
        let list =
            filter === 'all' ? localFiles
                : filter === 'orphan' ? localFiles.filter((f) => !f.portfolioId)
                    : localFiles.filter((f) => f.portfolioId === filter);
        if (typeFilter === 'image') list = list.filter((f) => f.mimeType?.startsWith('image/'));
        if (typeFilter === 'video') list = list.filter((f) => f.mimeType?.startsWith('video/'));
        return list;
    })();

    const orphanCount = localFiles.filter((f) => !f.portfolioId).length;

    /* ── Lightbox ── */
    const lightboxFile = lightboxIndex !== null ? filtered[lightboxIndex] : null;

    const goNext = useCallback(() =>
        setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : null)),
        [filtered.length]);

    const goPrev = useCallback(() =>
        setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null)),
        [filtered.length]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIndex, goNext, goPrev]);

    /* ── Rename ── */
    const startRename = (file: StorageFile) => {
        setRenaming(file.fileKey);
        setRenameValue(file.displayName ?? file.fileName);
        setTimeout(() => renameInputRef.current?.select(), 50);
    };

    const confirmRename = async (fileKey: string) => {
        const name = renameValue.trim();
        if (!name) { setRenaming(null); return; }
        setRenameSaving(true);
        const mediaId = localFiles.find(f => f.fileKey === fileKey)?.id;
        try {
            const res = await fetch('/api/media', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: mediaId, displayName: name }),
            });
            if (!res.ok) {
                const json = (await res.json()) as { error?: string };
                setUploadError(json.error ?? 'Erreur lors du renommage.');
            } else {
                setLocalFiles((prev) =>
                    prev.map((f) => f.fileKey === fileKey ? { ...f, displayName: name } : f),
                );
            }
        } catch {
            setUploadError('Erreur réseau.');
        } finally {
            setRenameSaving(false);
            setRenaming(null);
        }
    };

    /* ── Upload ── */
    const handleUpload = useCallback(async (file: File) => {
        setUploadError(null);
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = (await res.json()) as { url?: string; key?: string; error?: string };
            if (!res.ok || !json.url || !json.key) {
                setUploadError(json.error ?? 'Erreur upload.');
            } else {
                setLocalFiles((prev) => [{
                    id: crypto.randomUUID(), fileKey: json.key!, url: json.url!,
                    fileName: file.name, fileSize: file.size, mimeType: file.type,
                    portfolioId: null, displayName: null, createdAt: new Date().toISOString(),
                }, ...prev]);
                router.refresh();
            }
        } catch { setUploadError('Erreur réseau.'); }
        finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }, [router]);

    /* ── Delete ── */
    const handleDeleteClick = (file: StorageFile) => {
        startTransition(async () => {
            const used = await checkFileUsedInPortfolios(file.fileKey);
            setUsedIn(used);
            setConfirmFile(file);
        });
    };

    const confirmDelete = async () => {
        if (!confirmFile) return;
        setLightboxIndex(null);
        setDeleting(confirmFile.fileKey);
        setConfirmFile(null);
        try {
            await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: confirmFile.id }),
            });
            setLocalFiles((prev) => prev.filter((f) => f.fileKey !== confirmFile.fileKey));
            router.refresh();
        } finally { setDeleting(null); }
    };

    return (
        <div className="space-y-4">
            {/* ── Upload zone ── */}
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-2.5">
                    AJOUTER DES MÉDIAS
                </p>
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void handleUpload(f); }}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 py-3.5 hover:border-[#ad7b60]/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                    {uploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin text-[#ad7b60]" /><span className="text-sm text-zinc-400">Upload en cours…</span></>
                    ) : (
                        <><Upload className="h-4 w-4 text-zinc-500" /><span className="text-sm text-zinc-400">Clique ou glisse ici</span><span className="text-[10px] text-zinc-600">Images · Vidéos · max 5Mo / 100Mo</span></>
                    )}
                </div>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); }} />
                {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}
            </div>

            {/* ── Filters row ── */}
            <div className="flex flex-wrap gap-2">
                {/* Type */}
                {(['all', 'image', 'video'] as const).map((t) => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${typeFilter === t ? 'border-[#ad7b60] bg-[#ad7b60]/10 text-[#d4a485]' : 'border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}>
                        {t === 'all' ? 'Tout' : t === 'image' ? '📷 Images' : '🎬 Vidéos'}
                    </button>
                ))}
                <span className="text-zinc-700 self-center">·</span>
                {/* Portfolio */}
                <button onClick={() => setFilter('all')}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${filter === 'all' ? 'border-[#ad7b60] bg-[#ad7b60]/10 text-[#d4a485]' : 'border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}>
                    Tous ({localFiles.length})
                </button>
                {portfoliosWithFiles.map((p) => (
                    <button key={p.id} onClick={() => setFilter(p.id)}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${filter === p.id ? 'border-[#ad7b60] bg-[#ad7b60]/10 text-[#d4a485]' : 'border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}>
                        {p.title} ({localFiles.filter((f) => f.portfolioId === p.id).length})
                    </button>
                ))}
                {orphanCount > 0 && (
                    <button onClick={() => setFilter('orphan')}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${filter === 'orphan' ? 'border-[#ad7b60] bg-[#ad7b60]/10 text-[#d4a485]' : 'border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}>
                        Médiathèque ({orphanCount})
                    </button>
                )}
            </div>

            {/* ── Grid ── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-14 text-center">
                    <ImageIcon className="h-7 w-7 text-zinc-700" />
                    <p className="text-sm text-zinc-600">Aucun fichier ici</p>
                    <p className="text-xs text-zinc-700">Utilise la zone d&apos;upload ci-dessus pour commencer.</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-1 sm:grid-cols-5 md:grid-cols-6">
                    {filtered.map((file, idx) => (
                        <button
                            key={file.id}
                            onClick={() => setLightboxIndex(idx)}
                            className="group relative aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ad7b60]"
                        >
                            {file.mimeType?.startsWith('video/') ? (
                                <video src={file.url} className="h-full w-full object-cover" muted preload="metadata" />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={file.url} alt={file.fileName} className="h-full w-full object-cover" loading="lazy" />
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex items-end bg-zinc-950/0 transition-colors group-hover:bg-zinc-950/40">
                                <span className="w-full truncate px-1 pb-1 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                                    {file.displayName ?? file.fileName}
                                </span>
                            </div>
                            {deleting === file.fileKey && (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Lightbox ── */}
            {lightboxFile && lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setLightboxIndex(null); }}
                >
                    {/* Close */}
                    <button onClick={() => setLightboxIndex(null)}
                        className="absolute right-4 top-4 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>

                    {/* Counter + actions */}
                    <div className="absolute left-4 top-4 flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-500">
                            {lightboxIndex + 1} / {filtered.length}
                        </span>
                        <button
                            onClick={() => handleDeleteClick(lightboxFile)}
                            disabled={isPending || !!deleting}
                            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-zinc-900 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                        </button>
                    </div>

                    {/* File info + rename */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-center backdrop-blur-sm min-w-[200px]">
                        {renaming === lightboxFile.fileKey ? (
                            <form
                                onSubmit={(e) => { e.preventDefault(); void confirmRename(lightboxFile.fileKey); }}
                                className="flex items-center gap-1.5"
                            >
                                <input
                                    ref={renameInputRef}
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    className="flex-1 bg-zinc-800 border border-[#ad7b60]/50 rounded px-2 py-0.5 text-[11px] text-white font-mono outline-none min-w-0"
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === 'Escape') setRenaming(null); }}
                                />
                                <button type="submit" disabled={renameSaving} className="text-[#ad7b60] hover:text-[#d4a485] disabled:opacity-50">
                                    {renameSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                </button>
                                <button type="button" onClick={() => setRenaming(null)} className="text-zinc-500 hover:text-zinc-300">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <p className="font-mono text-[10px] text-zinc-400 truncate max-w-xs">
                                    {lightboxFile.displayName ?? lightboxFile.fileName}
                                </p>
                                <button
                                    onClick={() => startRename(lightboxFile)}
                                    className="shrink-0 text-zinc-600 hover:text-[#ad7b60] transition-colors"
                                    title="Renommer"
                                >
                                    <Pencil className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-zinc-600">{formatBytes(lightboxFile.fileSize)} · {timeAgo(lightboxFile.createdAt)}</p>
                    </div>

                    {/* Prev */}
                    {filtered.length > 1 && (
                        <button onClick={goPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-dashed border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-sm">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}

                    {/* Media */}
                    <div className="mx-20 flex max-h-[80vh] max-w-3xl items-center justify-center">
                        {lightboxFile.mimeType?.startsWith('video/') ? (
                            <video
                                key={lightboxFile.id}
                                src={lightboxFile.url}
                                controls
                                autoPlay
                                className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
                            />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={lightboxFile.id}
                                src={lightboxFile.url}
                                alt={lightboxFile.fileName}
                                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                            />
                        )}
                    </div>

                    {/* Next */}
                    {filtered.length > 1 && (
                        <button onClick={goNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-dashed border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-sm">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}

                    {/* Dot strip */}
                    {filtered.length > 1 && filtered.length <= 20 && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1">
                            {filtered.map((_, i) => (
                                <button key={i} onClick={() => setLightboxIndex(i)}
                                    className={`h-1.5 rounded-full transition-all ${i === lightboxIndex ? 'w-4 bg-zinc-50' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Confirm delete dialog ── */}
            {confirmFile && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-6 shadow-2xl">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-white">Supprimer ce fichier ?</p>
                                <p className="mt-1 text-sm text-zinc-400">Cette action est irréversible.</p>
                                {usedIn.length > 0 && (
                                    <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-300">
                                        Attention : utilisé dans « {usedIn.join('", "')} ». Il disparaîtra du portfolio.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmFile(null)}
                                className="flex-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => void confirmDelete()}
                                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-400 transition-colors">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

