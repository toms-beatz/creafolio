import { createAdminClient } from "@/lib/supabase/server";
import { updateConfigAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

/** Config key metadata for display */
const configMeta: Record<
    string,
    { label: string; description: string; type: "number" | "boolean" | "text" }
> = {
    trial_duration_days: {
        label: "Durée du trial (jours)",
        description: "Nombre de jours pour la période d'essai gratuite.",
        type: "number",
    },
    max_portfolios_free: {
        label: "Portfolios max (Free)",
        description: "Nombre maximum de portfolios pour les utilisateurs Free.",
        type: "number",
    },
    max_portfolios_premium: {
        label: "Portfolios max (Premium)",
        description: "Nombre maximum de portfolios pour les utilisateurs Premium.",
        type: "number",
    },
    max_blocks_free: {
        label: "Blocs max par portfolio (Free)",
        description: "Nombre maximum de blocs dans un portfolio pour les utilisateurs Free.",
        type: "number",
    },
    max_blocks_premium: {
        label: "Blocs max par portfolio (Premium)",
        description: "Nombre maximum de blocs dans un portfolio pour les utilisateurs Premium.",
        type: "number",
    },
    maintenance_mode: {
        label: "Mode maintenance",
        description:
            "Quand activé, seuls les admins peuvent accéder à la plateforme.",
        type: "boolean",
    },
};

/**
 * Admin Config — US-1208
 * Key/value configuration stored in app_config table.
 */
export default async function AdminConfigPage() {
    const admin = createAdminClient();

    const { data: configs } = await admin
        .from("app_config")
        .select("*")
        .order("key");

    // Build a map for easy lookup
    const configMap = new Map(
        (configs ?? []).map((c) => [c.key, c]),
    );

    // All config keys we want to display (including those not yet in DB)
    const allKeys = Object.keys(configMeta);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // CONFIGURATION
                </p>
                <h1 className="text-2xl font-bold text-white">
                    Paramètres de la plateforme
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Configuration globale stockée en base. Chaque modification est loguée
                    dans l&apos;audit log.
                </p>
            </div>

            {/* Config form */}
            <div className="space-y-4">
                {allKeys.map((key) => {
                    const meta = configMeta[key];
                    const config = configMap.get(key);
                    const currentValue =
                        config?.value !== undefined && config?.value !== null
                            ? String(config.value)
                            : "";

                    return (
                        <form
                            key={key}
                            action={updateConfigAction}
                            className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5"
                        >
                            <input type="hidden" name="key" value={key} />

                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{meta.label}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {meta.description}
                                    </p>
                                    <p className="font-mono text-[10px] text-zinc-700 mt-1">
                                        key: {key}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-start">
                                    {meta.type === "boolean" ? (
                                        <select
                                            name="value"
                                            defaultValue={currentValue || "false"}
                                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-400/50 focus:outline-none"
                                        >
                                            <option value="false">Désactivé</option>
                                            <option value="true">Activé</option>
                                        </select>
                                    ) : meta.type === "number" ? (
                                        <input
                                            type="number"
                                            name="value"
                                            defaultValue={currentValue}
                                            className="w-24 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white text-center focus:border-orange-400/50 focus:outline-none"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            name="value"
                                            defaultValue={currentValue}
                                            className="w-48 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-400/50 focus:outline-none"
                                        />
                                    )}

                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="text-orange-400/60 hover:text-orange-400 h-9 px-3"
                                    >
                                        Sauvegarder
                                    </Button>
                                </div>
                            </div>

                            {/* Last updated */}
                            {config && (
                                <p className="text-[10px] text-zinc-700 mt-2">
                                    Dernière modification :{" "}
                                    {new Date(config.updated_at).toLocaleString("fr-FR", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    })}
                                </p>
                            )}
                        </form>
                    );
                })}
            </div>

            {/* Admin emails section — US-1207 */}
            <div className="mt-10">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-4">
                    EMAILS ADMIN
                </p>
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5">
                    <p className="text-sm text-zinc-400 mb-4">
                        MVP : Liens mailto pré-remplis pour les communications utilisateur.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="mailto:?subject=Bienvenue%20sur%20Blooprint%20!&body=Bonjour%2C%0A%0AMerci%20de%20vous%20%C3%AAtre%20inscrit%20sur%20Blooprint%20!%20Nous%20sommes%20ravis%20de%20vous%20compter%20parmi%20nos%20utilisateurs.%0A%0AN%27h%C3%A9sitez%20pas%20%C3%A0%20nous%20contacter%20si%20vous%20avez%20des%20questions.%0A%0AL%27%C3%A9quipe%20Blooprint"
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                        >
                            Bienvenue
                        </a>
                        <a
                            href="mailto:?subject=Votre%20trial%20Blooprint%20expire%20bient%C3%B4t&body=Bonjour%2C%0A%0AVotre%20p%C3%A9riode%20d%27essai%20Premium%20sur%20Blooprint%20arrive%20%C3%A0%20son%20terme.%20Pour%20continuer%20%C3%A0%20profiter%20de%20toutes%20les%20fonctionnalit%C3%A9s%2C%20rendez-vous%20sur%20blooprint.fr%2Fpricing.%0A%0AL%27%C3%A9quipe%20Blooprint"
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                        >
                            Trial expiration
                        </a>
                        <a
                            href="mailto:?subject=Action%20sur%20votre%20portfolio%20Blooprint&body=Bonjour%2C%0A%0ANous%20avons%20du%20prendre%20une%20action%20sur%20votre%20portfolio%20suite%20%C3%A0%20un%20signalement.%20Merci%20de%20consulter%20nos%20CGU%20pour%20plus%20d%27informations.%0A%0AL%27%C3%A9quipe%20Blooprint"
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                        >
                            Action modération
                        </a>
                        <a
                            href="mailto:?subject=Votre%20compte%20Blooprint%20a%20%C3%A9t%C3%A9%20suspendu&body=Bonjour%2C%0A%0AVotre%20compte%20a%20%C3%A9t%C3%A9%20suspendu%20pour%20violation%20de%20nos%20CGU.%20Si%20vous%20pensez%20qu%27il%20s%27agit%20d%27une%20erreur%2C%20contactez-nous.%0A%0AL%27%C3%A9quipe%20Blooprint"
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                        >
                            Suspension compte
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
