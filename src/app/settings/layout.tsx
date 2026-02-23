import { redirect } from 'next/navigation';

/**
 * Layout /settings/* — redirige vers /dashboard/account
 * Les settings sont désormais intégrés dans le dashboard.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    redirect('/dashboard/account');
    return <>{children}</>;
}
