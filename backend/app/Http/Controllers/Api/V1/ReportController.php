<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'portfolio_id' => 'required|integer|min:1|exists:portfolios,id',
            'motif' => 'required|string|in:spam,inappropriate,impersonation,copyright,other',
            'description' => 'nullable|string|max:500',
        ]);

        $hash = sha1($request->ip() . date('Y-m-d'));
        $duplicate = Report::where('portfolio_id', $validated['portfolio_id'])
            ->where('reporter_hash', $hash)
            ->whereDate('created_at', today())
            ->exists();

        if ($duplicate) {
            return response()->json(['message' => 'Already reported today'], 429);
        }

        Report::create([
            'id' => Str::uuid(),
            'portfolio_id' => $validated['portfolio_id'],
            'motif' => $validated['motif'],
            'description' => $validated['description'] ?? null,
            'reporter_hash' => $hash,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Report submitted'], 201);
    }
}
