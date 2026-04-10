<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::with('user:id,name')
            ->where('status', 'approved')
            ->orderByDesc('featured')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $testimonials]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|min:10|max:1000',
            'rating' => 'required|integer|min:1|max:5',
            'display_name' => 'nullable|string|max:100',
            'display_role' => 'nullable|string|max:100',
        ]);

        $user = $request->user();

        $existing = Testimonial::where('user_id', $user->id)->exists();
        if ($existing) {
            return response()->json(['message' => 'You already submitted a testimonial'], 422);
        }

        $testimonial = Testimonial::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'content' => $validated['content'],
            'rating' => $validated['rating'],
            'display_name' => $validated['display_name'] ?? $user->name,
            'display_role' => $validated['display_role'] ?? null,
            'status' => 'pending',
            'featured' => false,
        ]);

        return response()->json(['data' => $testimonial], 201);
    }
}
