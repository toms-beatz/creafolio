export default function AdminLogsPage() {
    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // LOGS</p>
                <h1 className="text-2xl font-bold text-white">Logs système</h1>
            </div>
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                <p className="text-zinc-500 text-sm">Logs disponibles dans Sentry / serveur.</p>
            </div>
        </div>
    );
}
