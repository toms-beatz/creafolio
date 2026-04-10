<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\PortfolioLinkClicked;
use App\Events\PortfolioViewed;
use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\PortfolioAnalytic;
use App\Models\PortfolioLinkClick;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AnalyticsController extends Controller
{
    /** Resolve ISO country code + city from IP using ip-api.com (free, no key needed). */
    private function geoFromIp(string $ip): array
    {
        if (in_array($ip, ['127.0.0.1', '::1', '']) || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.') || str_starts_with($ip, '172.')) {
            return ['country_code' => null, 'city' => null];
        }
        try {
            $res = Http::timeout(2)->get("http://ip-api.com/json/{$ip}", [
                'fields' => 'status,countryCode,city',
                'lang'   => 'fr',
            ]);
            if ($res->ok() && $res->json('status') === 'success') {
                return [
                    'country_code' => $res->json('countryCode') ?: null,
                    'city'         => $res->json('city') ?: null,
                ];
            }
        } catch (\Throwable) { /* ignore — geo is best-effort */
        }
        return ['country_code' => null, 'city' => null];
    }

    /** Detect device type from User-Agent (mobile / tablet / desktop). */
    private function deviceType(string $ua): string
    {
        if (preg_match('/tablet|ipad|playbook|silk/i', $ua)) return 'tablet';
        if (preg_match('/mobile|android|iphone|ipod|windows phone|blackberry/i', $ua)) return 'mobile';
        return 'desktop';
    }

    /** Detect browser name from User-Agent. */
    private function browserFromUa(string $ua): string
    {
        if (preg_match('/Edg\//i', $ua))              return 'Edge';
        if (preg_match('/OPR\/|Opera/i', $ua))        return 'Opera';
        if (preg_match('/SamsungBrowser/i', $ua))      return 'Samsung';
        if (preg_match('/Chrome\/[\d]/i', $ua))       return 'Chrome';
        if (preg_match('/Firefox\/[\d]/i', $ua))      return 'Firefox';
        if (preg_match('/Safari\/[\d]/i', $ua))       return 'Safari';
        if (preg_match('/MSIE|Trident/i', $ua))        return 'IE';
        return 'Other';
    }

    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'portfolio_id' => 'required|integer|min:1|exists:portfolios,id',
            'referrer' => 'nullable|url|max:500',
            'page_path' => 'nullable|string|max:200',
            'client_ip' => 'nullable|ip',  // IP publique envoyée par le client pour le geo
        ]);

        $ua = $request->userAgent() ?? '';
        $isBot = preg_match('/bot|crawl|spider|slurp|Googlebot|Bingbot/i', $ua);
        if ($isBot) {
            return response()->json(['ok' => true]);
        }

        // Chaque visite compte — pas de déduplication par session
        $ip = $request->ip() ?? '';
        // Utiliser l'IP publique envoyée par le client si l'IP serveur est privée (Docker/LAN)
        $geoIp = $validated['client_ip'] ?? $ip;
        $geo = $this->geoFromIp($geoIp);
        PortfolioAnalytic::create([
            'id'           => Str::uuid(),
            'portfolio_id' => $validated['portfolio_id'],
            'session_hash' => sha1($ip . $ua . $validated['portfolio_id'] . microtime()),
            'visitor_hash' => sha1($ip . $ua . $validated['portfolio_id']), // stable = même visiteur
            'referrer'     => $validated['referrer'] ?? null,
            'page_path'    => $validated['page_path'] ?? null,
            'country_code' => $geo['country_code'],
            'city'         => $geo['city'],
            'device_type'  => $this->deviceType($ua),
            'browser'      => $this->browserFromUa($ua),
            'is_bot'       => false,
            'viewed_at'    => now(),
        ]);

        // Real-time broadcast via Reverb
        $todayViews = PortfolioAnalytic::where('portfolio_id', $validated['portfolio_id'])
            ->whereDate('viewed_at', today())
            ->count();

        broadcast(new PortfolioViewed(
            portfolioId: (int) $validated['portfolio_id'],
            todayViews: $todayViews,
            viewedAt: now()->toISOString(),
        ));

        return response()->json(['ok' => true]);
    }

    public function click(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'portfolio_id' => 'required|integer|min:1|exists:portfolios,id',
            'link_type' => 'required|string|in:instagram,tiktok,youtube,twitter,linkedin,website,email,phone,other',
            'link_label' => 'nullable|string|max:100',
        ]);

        PortfolioLinkClick::create([
            'id' => Str::uuid(),
            'portfolio_id' => $validated['portfolio_id'],
            'link_type' => $validated['link_type'],
            'link_label' => $validated['link_label'] ?? null,
            'clicked_at' => now(),
        ]);

        broadcast(new PortfolioLinkClicked(
            portfolioId: (int) $validated['portfolio_id'],
            linkType: $validated['link_type'],
            clickedAt: now()->toISOString(),
        ));

        return response()->json(['ok' => true]);
    }

    public function summary(Request $request, string $portfolioId): JsonResponse
    {
        $portfolio = Portfolio::where('id', $portfolioId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $since30 = now()->subDays(30);
        $since7  = now()->subDays(7);

        $totalViews = PortfolioAnalytic::where('portfolio_id', $portfolio->id)
            ->where('is_bot', false)
            ->count();

        $views30d = PortfolioAnalytic::where('portfolio_id', $portfolio->id)
            ->where('is_bot', false)
            ->where('viewed_at', '>=', $since30)
            ->count();

        $views7d = PortfolioAnalytic::where('portfolio_id', $portfolio->id)
            ->where('is_bot', false)
            ->where('viewed_at', '>=', $since7)
            ->count();

        $byDay = PortfolioAnalytic::where('portfolio_id', $portfolio->id)
            ->where('is_bot', false)
            ->where('viewed_at', '>=', $since30)
            ->select(DB::raw("DATE(viewed_at) as date"), DB::raw('COUNT(*) as views'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => compact('totalViews', 'views30d', 'views7d', 'byDay'),
        ]);
    }

    public function referrers(Request $request, string $portfolioId): JsonResponse
    {
        $portfolio = Portfolio::where('id', $portfolioId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $since = now()->subDays($request->integer('days', 30));

        $referrers = PortfolioAnalytic::where('portfolio_id', $portfolio->id)
            ->where('is_bot', false)
            ->where('viewed_at', '>=', $since)
            ->select('referrer', DB::raw('COUNT(*) as count'))
            ->groupBy('referrer')
            ->orderByDesc('count')
            ->limit(20)
            ->get();

        return response()->json(['data' => $referrers]);
    }

    public function linkClicks(Request $request, string $portfolioId): JsonResponse
    {
        $portfolio = Portfolio::where('id', $portfolioId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $since = now()->subDays($request->integer('days', 30));

        $clicks = PortfolioLinkClick::where('portfolio_id', $portfolio->id)
            ->where('clicked_at', '>=', $since)
            ->select('link_type', DB::raw('COUNT(*) as count'))
            ->groupBy('link_type')
            ->orderByDesc('count')
            ->get();

        return response()->json(['data' => $clicks]);
    }

    public function visitors(Request $request, string $portfolioId): JsonResponse
    {
        $portfolio = Portfolio::where('id', $portfolioId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $since = now()->subDays($request->integer('days', 30));
        $sortBy   = in_array($request->get('sort'), ['viewed_at', 'country_code', 'city', 'device_type', 'referrer']) ? $request->get('sort') : 'viewed_at';
        $sortDir  = $request->get('dir') === 'asc' ? 'asc' : 'desc';

        // DISTINCT ON (visitor_hash) = un visiteur unique par hash, dernière visite conservée
        $rows = DB::table('portfolio_analytics')
            ->select(DB::raw('DISTINCT ON (visitor_hash) viewed_at, country_code, city, device_type, browser, referrer, page_path'))
            ->where('portfolio_id', $portfolio->id)
            ->where('is_bot', false)
            ->where('viewed_at', '>=', $since)
            ->orderBy('visitor_hash')
            ->orderBy('viewed_at', 'desc')
            ->get();

        // Tri final selon le paramètre demandé
        $sorted = $rows->sortBy($sortBy, SORT_REGULAR, $sortDir === 'desc')->values();

        return response()->json(['data' => $sorted]);
    }

    public function export(Request $request, string $portfolioId): \Illuminate\Http\Response
    {
        $portfolio = Portfolio::where('id', $portfolioId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $since = now()->subDays($request->integer('days', 30));

        $rows = PortfolioAnalytic::where('portfolio_id', $portfolio->id)
            ->where('viewed_at', '>=', $since)
            ->select('viewed_at', 'referrer', 'page_path', 'country_code', 'is_bot')
            ->orderBy('viewed_at')
            ->get();

        $csv  = "viewed_at,referrer,page_path,country_code,is_bot\n";
        foreach ($rows as $row) {
            $csv .= implode(',', [
                $row->viewed_at,
                str_replace(',', ' ', $row->referrer ?? ''),
                str_replace(',', ' ', $row->page_path ?? ''),
                $row->country_code ?? '',
                $row->is_bot ? '1' : '0',
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="analytics-' . $portfolio->slug . '.csv"',
        ]);
    }
}
