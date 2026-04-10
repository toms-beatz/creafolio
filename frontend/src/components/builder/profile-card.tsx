'use client';

import { Lock, Check } from 'lucide-react';
import type { UgcProfile } from '@/lib/themes';

interface ProfileCardProps {
    profile: UgcProfile;
    isActive?: boolean;
    isPremiumUser?: boolean;
    onClick?: () => void;
    compact?: boolean;
}

/**
 * Thumbnail visuel d'un profil UGC — US-1605
 * Réutilisable dans le wizard (étape 4) et dans le ThemePicker.
 */
export function ProfileCard({
    profile,
    isActive = false,
    isPremiumUser = false,
    onClick,
    compact = false,
}: ProfileCardProps) {
    const locked = profile.premium && !isPremiumUser;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={false} // toujours cliquable — affiche lock si fermé
            className={`relative flex flex-col rounded-xl border overflow-hidden text-left transition-all w-full ${isActive
                ? 'border-sky-400 ring-1 ring-sky-400/30'
                : 'border-zinc-700 hover:border-zinc-500'
                } ${locked ? 'opacity-80' : ''}`}
        >
            {/* Miniature CSS */}
            <div
                className={`relative w-full ${compact ? 'h-20' : 'h-28'} overflow-hidden`}
                style={{ background: profile.previewColors.bg }}
            >
                {/* Surface simulée */}
                <div
                    className="absolute left-3 right-3 top-3 rounded-lg opacity-40"
                    style={{ background: profile.previewColors.accent, height: 6 }}
                />
                {/* Blocs de contenu simulés */}
                <div className="absolute left-3 top-12 flex flex-col gap-1.5">
                    <div
                        className="h-2 w-16 rounded-full opacity-70"
                        style={{ background: profile.previewColors.text }}
                    />
                    <div
                        className="h-1.5 w-10 rounded-full opacity-40"
                        style={{ background: profile.previewColors.text }}
                    />
                </div>
                {/* Accent bar gauche */}
                <div
                    className="absolute bottom-0 left-0 top-0 w-1"
                    style={{ background: profile.previewColors.accent }}
                />
                {/* Lock overlay */}
                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
                        <Lock className="h-5 w-5 text-zinc-400" />
                    </div>
                )}
                {/* Active check */}
                {isActive && !locked && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400">
                        <Check className="h-3 w-3 text-zinc-950" />
                    </div>
                )}
            </div>

            {/* Infos */}
            <div className="flex flex-col gap-1 p-2.5" style={{ background: '#18181b' }}>
                <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-zinc-100 truncate">{profile.label}</span>
                    <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${profile.premium
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                    >
                        {profile.premium ? 'PRO' : 'FREE'}
                    </span>
                </div>
                {!compact && (
                    <div className="flex flex-wrap gap-1">
                        {profile.targetNiches.slice(0, 2).map((n) => (
                            <span key={n} className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                                {n}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
}
