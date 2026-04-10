import { redirect } from "next/navigation";
import Link from "next/link";
import { getMe } from "@/lib/api-server";
import { api } from "@/lib/api-server";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    Flag,
    MessageSquare,
    CreditCard,
    FileText,
    Settings,
    ArrowLeft,
    Quote,
    LayoutGrid,
    Palette,
} from "lucide-react";

const adminNav = [
    {
        label: "Overview",
        href: "/admin",
        id: "overview",
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        label: "Utilisateurs",
        href: "/admin/users",
        id: "users",
        icon: <Users className="h-4 w-4" />,
    },
    {
        label: "Portfolios",
        href: "/admin/portfolios",
        id: "portfolios",
        icon: <FolderOpen className="h-4 w-4" />,
    },
    {
        label: "Signalements",
        href: "/admin/reports",
        id: "reports",
        icon: <Flag className="h-4 w-4" />,
        badge: true,
    },
    {
        label: "Support",
        href: "/admin/support",
        id: "support",
        icon: <MessageSquare className="h-4 w-4" />,
        badge: true,
    },
    {
        label: "Témoignages",
        href: "/admin/testimonials",
        id: "testimonials",
        icon: <Quote className="h-4 w-4" />,
        badge: true,
    },
    {
        label: "Billing",
        href: "/admin/billing",
        id: "billing",
        icon: <CreditCard className="h-4 w-4" />,
    },
    {
        label: "Logs",
        href: "/admin/logs",
        id: "logs",
        icon: <FileText className="h-4 w-4" />,
    },
    {
        label: "Templates de thèmes",
        href: "/admin/themes",
        id: "themes",
        icon: <Palette className="h-4 w-4" />,
    },
    {
        label: "Templates (flags)",
        href: "/admin/templates",
        id: "templates",
        icon: <LayoutGrid className="h-4 w-4" />,
    },
    {
        label: "Config",
        href: "/admin/config",
        id: "config",
        icon: <Settings className="h-4 w-4" />,
    },
];

/**
 * Admin layout — US-1206
 * Guard: redirige vers /dashboard si l'utilisateur n'est pas admin.
 * Sidebar navigation + header distinctif (orange accents).
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth + admin role check — parallel fetch
    let profile: { username: string; role: string } | null = null;
    let stats: { pendingReports?: number; openTickets?: number } = {};
    try {
        const [meData, statsData] = await Promise.all([
            getMe(),
            api.get<{ pendingReports: number; openTickets: number }>("/v1/admin/stats").catch(() => ({ pendingReports: 0, openTickets: 0 })),
        ]);
        profile = meData.user?.profile ?? null;
        if (!profile || profile.role !== 'admin') redirect('/dashboard');
        stats = statsData;
    } catch {
        redirect('/login');
    }

    const pendingReports = stats.pendingReports ?? 0;
    const openTickets = stats.openTickets ?? 0;

    // Items for mobile bottom nav (5 key pages)
    const mobileNavItems = [
        { label: "Home", href: "/admin", id: "overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: "Users", href: "/admin/users", id: "users", icon: <Users className="h-4 w-4" /> },
        {
            label: "Reports",
            href: "/admin/reports",
            id: "reports",
            icon: <Flag className="h-4 w-4" />,
            badgeCount: pendingReports ?? 0,
        },
        {
            label: "Support",
            href: "/admin/support",
            id: "support",
            icon: <MessageSquare className="h-4 w-4" />,
            badgeCount: openTickets ?? 0,
        },
        { label: "Config", href: "/admin/config", id: "config", icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar — hidden on mobile */}
            <aside aria-label="Menu administration" className="hidden md:flex w-56 shrink-0 border-r border-dashed border-orange-900/30 bg-zinc-950 flex-col sticky top-0 h-screen">
                {/* Logo */}
                <div className="flex items-center gap-2 px-4 h-14 border-b border-dashed border-orange-900/30">
                    <span className="text-orange-400 font-bold text-base">B</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60">
                        ADMIN
                    </span>
                </div>

                {/* Nav */}
                <nav aria-label="Navigation admin" className="flex-1 px-3 py-4 space-y-1">
                    {adminNav.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-orange-300 hover:bg-orange-400/5 transition-colors font-medium group"
                        >
                            <span className="opacity-60 group-hover:opacity-100">
                                {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (() => {
                                const count = item.id === "support" ? (openTickets ?? 0) : item.id === "reports" ? (pendingReports ?? 0) : 0;
                                return count > 0 ? (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 font-mono text-[10px] text-red-400">
                                        {count}
                                    </span>
                                ) : null;
                            })()}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="px-3 py-4 border-t border-dashed border-orange-900/30 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Retour Dashboard
                    </Link>
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
                {/* Header — desktop */}
                <header className="hidden md:flex h-14 border-b border-dashed border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-40 items-center justify-between px-6">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                        CREAFOLIO // ADMIN PANEL
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-dashed border-orange-400/30 bg-orange-400/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-orange-400">
                            admin
                        </span>
                        <span className="font-mono text-xs text-zinc-600">
                            @{profile.username}
                        </span>
                    </div>
                </header>

                {/* Header — mobile */}
                <header className="md:hidden h-14 border-b border-dashed border-orange-900/30 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-bold text-base">B</span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60">
                            ADMIN
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-dashed border-orange-400/30 bg-orange-400/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-orange-400">
                            admin
                        </span>
                        <span className="font-mono text-xs text-zinc-600">
                            @{profile.username}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main id="main-content" className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
            </div>

            {/* Mobile bottom nav */}
            <AdminMobileNav items={mobileNavItems} />
        </div>
    );
}
