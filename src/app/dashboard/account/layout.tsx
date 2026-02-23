import Link from "next/link";

const accountNav = [
    { label: "Profil", href: "/dashboard/account", id: "profile" },
    { label: "Facturation", href: "/dashboard/account/billing", id: "billing" },
    { label: "Vie privée", href: "/dashboard/account/privacy", id: "privacy" },
];

/**
 * Layout pour /dashboard/account/* — tabs internes
 */
export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-6">
            {/* Heading */}
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    DASHBOARD // COMPTE
                </p>
                <h1 className="text-2xl font-bold text-white">Mon compte</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Gère ton profil, abonnement et paramètres.
                </p>
            </div>

            {/* Tab nav */}
            <nav className="flex gap-1 border-b border-dashed border-zinc-800 pb-px overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
                {accountNav.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="rounded-t-lg px-3 sm:px-4 py-2 text-sm text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-colors font-medium whitespace-nowrap"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Content */}
            <div>{children}</div>
        </div>
    );
}
