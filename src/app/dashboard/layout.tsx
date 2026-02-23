import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import {
    FolderOpen,
    BarChart3,
    MessageSquare,
    Settings,
    ArrowRight,
    LayoutDashboard,
    Quote,
} from "lucide-react";

const dashboardNav = [
    {
        label: "Portfolios",
        href: "/dashboard",
        id: "portfolios",
        icon: <FolderOpen className="h-4 w-4" />,
    },
    {
        label: "Analytics",
        href: "/dashboard/analytics",
        id: "analytics",
        icon: <BarChart3 className="h-4 w-4" />,
    },
    {
        label: "Témoignage",
        href: "/dashboard/testimonial",
        id: "testimonial",
        icon: <Quote className="h-4 w-4" />,
    },
    {
        label: "Support",
        href: "/dashboard/support",
        id: "support",
        icon: <MessageSquare className="h-4 w-4" />,
    },
    {
        label: "Compte",
        href: "/dashboard/account",
        id: "account",
        icon: <Settings className="h-4 w-4" />,
    },
];

/**
 * Layout partagé pour tout /dashboard/*
 * Sidebar navigation + header commun.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, plan, trial_ends_at, role")
        .eq("id", user.id)
        .single();

    if (!profile?.username) redirect("/setup/username");

    const isPremium =
        profile.plan === "premium" ||
        (profile.plan === "trial" &&
            !!profile.trial_ends_at &&
            new Date(profile.trial_ends_at) > new Date());

    const trialDaysLeft = profile.trial_ends_at
        ? Math.max(
            0,
            Math.ceil(
                (new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000,
            ),
        )
        : 0;
    const isTrialActive = profile.plan === "trial" && trialDaysLeft > 0;

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar — hidden on mobile */}
            <aside aria-label="Menu du tableau de bord" className="hidden md:flex w-56 shrink-0 border-r border-dashed border-zinc-800 bg-zinc-950 flex-col sticky top-0 h-screen">
                {/* Logo */}
                <div className="flex items-center gap-2 px-4 h-14 border-b border-dashed border-zinc-800">
                    <Link href="/" className="text-base font-bold tracking-tight">
                        <span className="text-sky-400">B</span>looprint
                    </Link>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-dashed border-zinc-800">
                    <p className="font-mono text-xs text-zinc-400 truncate">
                        @{profile.username}
                    </p>
                    <span
                        className={`mt-1.5 inline-block rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${isPremium
                            ? "border-sky-400/30 bg-sky-400/5 text-sky-400"
                            : "border-zinc-700 text-zinc-500"
                            }`}
                    >
                        {profile.plan}
                    </span>
                </div>

                {/* Nav */}
                <nav aria-label="Navigation dashboard" className="flex-1 px-3 py-4 space-y-1">
                    {dashboardNav.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-sky-300 hover:bg-sky-400/5 transition-colors font-medium group"
                        >
                            <span className="opacity-60 group-hover:opacity-100">
                                {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Trial banner */}
                {isTrialActive && (
                    <div className="mx-3 mb-3 rounded-lg border border-dashed border-sky-400/30 bg-sky-400/5 px-3 py-3">
                        <p className="text-[10px] font-semibold text-sky-300">
                            Trial —{" "}
                            {trialDaysLeft === 1
                                ? "1 jour"
                                : `${trialDaysLeft} jours`}
                        </p>
                        <Link
                            href="/pricing"
                            className="mt-1 flex items-center gap-1 text-[10px] text-sky-400/70 hover:text-sky-400 transition-colors"
                        >
                            Passer Premium <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}

                {/* Bottom */}
                <div className="px-3 py-4 border-t border-dashed border-zinc-800 space-y-2">
                    {profile.role === "admin" && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-400/60 hover:text-orange-400 transition-colors"
                        >
                            <LayoutDashboard className="h-3.5 w-3.5" /> Admin panel
                        </Link>
                    )}
                    <form action={logoutAction}>
                        <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="w-full justify-start text-zinc-600 hover:text-white text-xs"
                        >
                            Déconnexion
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <header className="flex md:hidden items-center justify-between h-12 px-4 border-b border-dashed border-zinc-800 bg-zinc-950 sticky top-0 z-40">
                    <Link href="/" className="text-sm font-bold tracking-tight">
                        <span className="text-sky-400">B</span>looprint
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[100px]">
                            @{profile.username}
                        </span>
                        <span
                            className={`rounded-full border border-dashed px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest ${isPremium
                                ? "border-sky-400/30 bg-sky-400/5 text-sky-400"
                                : "border-zinc-700 text-zinc-500"
                                }`}
                        >
                            {profile.plan}
                        </span>
                    </div>
                </header>

                <main id="main-content" className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
            </div>

            {/* Mobile bottom nav */}
            <MobileBottomNav items={dashboardNav} />
        </div>
    );
}
