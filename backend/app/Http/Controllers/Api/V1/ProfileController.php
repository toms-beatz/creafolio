<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /** GET /profiles/{username} — Public profile page */
    public function show(string $username): JsonResponse
    {
        $profile = Profile::where('username', $username)
            ->withTrashed(false)
            ->firstOrFail();

        $user = User::find($profile->id);
        $portfolios = Portfolio::where('user_id', $user->id)
            ->where('status', 'published')
            ->get(['id', 'title', 'slug', 'theme', 'published_at']);

        return response()->json([
            'data' => [
                'username' => $profile->username,
                'display_name' => $profile->display_name ?? $user->name,
                'bio' => $profile->bio,
                'avatar_url' => $profile->avatar_url,
                'plan' => $profile->plan,
                'portfolios' => $portfolios,
            ],
        ]);
    }

    /** GET /profile — Current user's own profile */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile' => $user->profile,
            ],
        ]);
    }

    /** PATCH /profile — Update own profile */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'display_name' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500',
            'avatar_url' => 'nullable|url',
            'username' => 'nullable|string|min:3|max:30|regex:/^[a-z0-9_-]+$/|unique:profiles,username,' . $request->user()->id,
        ]);

        $user = $request->user();
        $profile = $user->profile ?? Profile::firstOrCreate(
            ['id' => $user->id],
            ['email' => $user->email, 'username' => null, 'plan' => 'free', 'role' => 'user']
        );

        $profile->update($validated);

        if (isset($validated['display_name'])) {
            $user->update(['name' => $validated['display_name']]);
        }

        return response()->json(['data' => $profile]);
    }
}
