import { redirect } from 'next/navigation';

/**
 * Redirect /legal/cgu → /legal/terms
 * Le footer utilise /legal/cgu, la page complète est à /legal/terms.
 */
export default function CguPage() {
    redirect('/legal/terms');
}
