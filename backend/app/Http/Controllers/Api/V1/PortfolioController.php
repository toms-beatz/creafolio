<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PortfolioResource;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class PortfolioController extends Controller
{
    /** GET /portfolios/by-slug/{slug} — Public, no auth */
    public function showBySlug(string $slug): JsonResponse
    {
        $portfolio = Portfolio::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $profile = \App\Models\Profile::find($portfolio->user_id);

        return response()->json([
            'data' => [
                'id'           => $portfolio->id,
                'title'        => $portfolio->title,
                'slug'         => $portfolio->slug,
                'craft_state'  => $portfolio->craft_state,
                'theme'        => $portfolio->theme,
                'status'       => $portfolio->status,
                'published_at' => $portfolio->published_at,
                'user' => [
                    'username'      => $profile?->username,
                    'display_name'  => $profile?->display_name,
                    'plan'          => $profile?->plan,
                    'trial_ends_at' => $profile?->trial_ends_at,
                ],
            ],
        ]);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $portfolios = $request->user()
            ->portfolios()
            ->orderByDesc('updated_at')
            ->paginate(20);

        return PortfolioResource::collection($portfolios);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'content'      => ['nullable', 'array'],
            'craft_state'  => ['nullable', 'array'],
            'theme'        => ['nullable', 'string', 'max:100'],
            'status'       => ['sometimes', 'string', 'in:draft,published,suspended'],
        ]);

        $base = Str::slug($validated['title']);
        $slug = $base;
        $i = 2;
        while (\App\Models\Portfolio::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $portfolio = $request->user()->portfolios()->create([
            ...$validated,
            'slug' => $slug,
        ]);

        return response()->json([
            'data'    => new PortfolioResource($portfolio),
            'message' => 'Portfolio created.',
        ], 201);
    }

    public function show(Request $request, Portfolio $portfolio): JsonResponse
    {
        $this->authorizeOwnership($request, $portfolio);

        return response()->json(['data' => new PortfolioResource($portfolio)]);
    }

    public function update(Request $request, Portfolio $portfolio): JsonResponse
    {
        $this->authorizeOwnership($request, $portfolio);

        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'slug'         => ['sometimes', 'string', 'max:100', 'regex:/^[a-z0-9-]+$/'],
            'description'  => ['nullable', 'string'],
            'content'      => ['nullable', 'array'],
            'craft_state'  => ['nullable', 'array'],
            'theme'        => ['nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
            'status'       => ['sometimes', 'string', 'in:draft,published,suspended'],
        ]);

        // Slug uniqueness check (exclude current portfolio)
        if (isset($validated['slug'])) {
            $slugTaken = \App\Models\Portfolio::where('slug', $validated['slug'])
                ->where('id', '!=', $portfolio->id)
                ->exists();
            if ($slugTaken) {
                return response()->json([
                    'message' => 'Ce slug est déjà utilisé.',
                    'errors'  => ['slug' => ['Ce slug est déjà utilisé.']],
                ], 422);
            }
        }

        // Sync is_published ↔ status
        if (isset($validated['is_published'])) {
            $validated['status'] = $validated['is_published'] ? 'published' : 'draft';
            if ($validated['is_published'] && ! $portfolio->published_at) {
                $validated['published_at'] = now();
            }
            unset($validated['is_published']);
        } elseif (isset($validated['status'])) {
            $validated['is_published'] = $validated['status'] === 'published';
            if ($validated['is_published'] && ! $portfolio->published_at) {
                $validated['published_at'] = now();
            }
        }

        $portfolio->update($validated);

        return response()->json(['data' => new PortfolioResource($portfolio)]);
    }

    public function checkSlug(Request $request): JsonResponse
    {
        $request->validate([
            'slug'         => 'required|string|max:100|regex:/^[a-z0-9-]+$/',
            'portfolio_id' => 'nullable|integer',
        ]);

        $slug = $request->input('slug');

        $reserved = [
            'admin',
            'api',
            'support',
            'login',
            'signup',
            'register',
            'logout',
            'settings',
            'dashboard',
            'builder',
            'pricing',
            'preview',
            'legal',
            'guide',
            'blooprint',
            'analytics',
            'setup',
            'onboarding'
        ];

        if (in_array($slug, $reserved)) {
            return response()->json(['available' => false, 'reason' => 'reserved']);
        }

        $taken = \App\Models\Portfolio::where('slug', $slug)
            ->when($request->input('portfolio_id'), fn($q, $id) => $q->where('id', '!=', $id))
            ->exists();

        return response()->json(['available' => !$taken]);
    }

    public function destroy(Request $request, Portfolio $portfolio): JsonResponse
    {
        $this->authorizeOwnership($request, $portfolio);

        $portfolio->delete();

        return response()->json(null, 204);
    }

    private function authorizeOwnership(Request $request, Portfolio $portfolio): void
    {
        if ($portfolio->user_id !== $request->user()->id) {
            abort(403, 'Forbidden.');
        }
    }
}
