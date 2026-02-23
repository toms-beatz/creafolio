'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetCraftState } from '@/features/builder/actions';

interface Props {
    children: React.ReactNode;
    portfolioId: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary autour du composant Craft.js.
 * US-207 CA-1 : capture les crashes Craft.js et affiche un message de récupération.
 */
export class BuilderErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // US-207 CA-4 — log structuré
        console.error('[BuilderErrorBoundary]', {
            portfolioId: this.props.portfolioId,
            error: error.message,
            componentStack: info.componentStack,
        });
    }

    handleReload = () => {
        this.setState({ hasError: false });
    };

    handleReset = async () => {
        const confirmed = window.confirm(
            'Réinitialiser le portfolio ? Tous les blocs actuels seront remplacés par le template par défaut.'
        );
        if (!confirmed) return;
        await resetCraftState(this.props.portfolioId);
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-400/60" />
                    <div>
                        <p className="text-base font-semibold text-white">
                            Une erreur est survenue dans le builder
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            {this.state.error?.message ?? 'Erreur inconnue'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={this.handleReload}
                            className="bg-sky-400 text-zinc-950 hover:bg-sky-300"
                        >
                            Recharger le builder
                        </Button>
                        <Button
                            onClick={() => void this.handleReset()}
                            variant="outline"
                            className="border-dashed border-zinc-700 text-zinc-400 hover:border-red-500/30 hover:text-red-400"
                        >
                            Réinitialiser le portfolio
                        </Button>
                    </div>
                    <p className="text-xs text-zinc-600">
                        Ton brouillon a été sauvegardé localement.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
