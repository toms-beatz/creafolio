<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\Portfolio;
use App\Models\Profile;
use App\Models\Report;
use App\Models\StorageUsage;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    private function r2Disk(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        return Storage::disk('r2');
    }

    public function debugStorage(): JsonResponse
    {
        $totalSize = StorageUsage::sum('file_size');
        $fileCount = StorageUsage::count();
        $byUser = StorageUsage::selectRaw('user_id, COUNT(*) as files, SUM(file_size) as size')
            ->groupBy('user_id')
            ->with('user:id,email')
            ->orderByDesc('size')
            ->limit(20)
            ->get();

        return response()->json([
            'total_size_bytes' => $totalSize,
            'total_files' => $fileCount,
            'top_users' => $byUser,
        ]);
    }

    public function backfillStorage(Request $request): JsonResponse
    {
        $count = 0;

        try {
            $disk = $this->r2Disk();
            $files = $disk->allFiles();
            foreach ($files as $key) {
                if (StorageUsage::where('file_key', $key)->exists()) continue;

                preg_match('/users\/(\d+)\//', $key, $m);
                $userId = $m[1] ?? null;
                if (!$userId || !User::find($userId)) continue;

                StorageUsage::create([
                    'id'           => Str::uuid(),
                    'user_id'      => $userId,
                    'file_key'     => $key,
                    'file_size'    => $disk->size($key),
                    'mime_type'    => null,
                    'display_name' => basename($key),
                ]);
                $count++;
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['backfilled' => $count]);
    }

    public function stats(): JsonResponse
    {
        $users = User::count();
        $portfolios = Portfolio::count();
        $published = Portfolio::where('status', 'published')->count();
        $premium = Profile::where('plan', 'premium')->count();
        $pendingReports = Report::where('status', 'pending')->count();
        $openTickets = SupportTicket::where('status', 'open')->count();

        return response()->json(compact('users', 'portfolios', 'published', 'premium', 'pendingReports', 'openTickets'));
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::with('profile')
            ->when(
                $request->input('search'),
                fn($q, $s) =>
                $q->where('email', 'like', "%$s%")->orWhere('name', 'like', "%$s%")
            )
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($users);
    }

    public function reports(): JsonResponse
    {
        $reports = Report::with('portfolio:id,title,slug,user_id')
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($reports);
    }

    public function testimonials(): JsonResponse
    {
        $testimonials = Testimonial::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($testimonials);
    }

    public function approveTestimonial(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:500',
            'featured' => 'nullable|boolean',
        ]);

        $t = Testimonial::findOrFail($id);
        $t->update($validated);

        return response()->json(['data' => $t]);
    }

    public function supportTickets(Request $request): JsonResponse
    {
        $query = SupportTicket::query()
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END")
            ->orderBy('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        if ($request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        if ($request->q) {
            $query->where('subject', 'ilike', '%' . $request->q . '%');
        }

        $perPage = 20;
        $tickets = $query->paginate($perPage);

        $openCount    = SupportTicket::whereIn('status', ['open', 'in_progress'])->count();
        $waitingCount = SupportTicket::where('status', 'waiting_user')->count();

        return response()->json([
            'data'          => $tickets->items(),
            'total'         => $tickets->total(),
            'pages'         => $tickets->lastPage(),
            'open_count'    => $openCount,
            'waiting_count' => $waitingCount,
        ]);
    }

    public function supportTicketShow(string $id): JsonResponse
    {
        $ticket = SupportTicket::with('messages')
            ->findOrFail($id);

        $userEmail = null;
        if ($ticket->user_id) {
            $user = User::find($ticket->user_id);
            $userEmail = $user?->email;
        }

        return response()->json(['data' => $ticket, 'user_email' => $userEmail]);
    }

    public function updateTicket(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::findOrFail($id);
        $validated = $request->validate([
            'status'     => 'sometimes|in:open,in_progress,waiting_user,resolved,closed',
            'priority'   => 'sometimes|in:low,normal,high,urgent',
            'admin_note' => 'sometimes|nullable|string|max:2000',
        ]);
        if (isset($validated['status']) && in_array($validated['status'], ['resolved', 'closed'])) {
            $validated['resolved_at'] = now();
        }
        $ticket->update($validated);
        return response()->json(['success' => true]);
    }

    public function addAdminMessage(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::findOrFail($id);
        $validated = $request->validate([
            'message'     => 'required|string|min:2|max:5000',
            'is_internal' => 'boolean',
        ]);
        SupportMessage::create([
            'id'          => Str::uuid(),
            'ticket_id'   => $ticket->id,
            'sender_type' => 'admin',
            'sender_id'   => $request->user()->id,
            'content'     => $validated['message'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);
        if (!($validated['is_internal'] ?? false)) {
            $ticket->update(['status' => 'waiting_user']);
        }
        return response()->json(['success' => true]);
    }

    public function portfolios(Request $request): JsonResponse
    {
        $query = Portfolio::with('user:id,email')
            ->orderByDesc('created_at');

        if ($request->status) $query->where('status', $request->status);
        if ($request->search) $query->where('title', 'ilike', "%{$request->search}%");

        $portfolios = $query->paginate(20);
        return response()->json(['data' => $portfolios->items(), 'total' => $portfolios->total()]);
    }

    public function updatePortfolio(Request $request, string $id): JsonResponse
    {
        $portfolio = Portfolio::findOrFail($id);
        $validated = $request->validate([
            'status'      => 'sometimes|string',
            'is_featured' => 'sometimes|boolean',
        ]);
        $portfolio->update($validated);
        return response()->json(['success' => true]);
    }

    public function destroyPortfolio(string $id): JsonResponse
    {
        $portfolio = Portfolio::findOrFail($id);
        $portfolio->delete();
        return response()->json(['success' => true]);
    }

    public function updateUser(Request $request, string $id): JsonResponse
    {
        $user = User::with('profile')->findOrFail($id);
        $action = $request->input('action');

        match ($action) {
            'suspend'      => $user->profile?->update(['role' => 'suspended']),
            'reactivate'   => $user->profile?->update(['role' => 'user']),
            'change_plan'  => $user->profile?->update(['plan' => $request->input('plan', 'free')]),
            'extend_trial' => $user->profile?->update([
                'plan' => 'trial',
                'trial_ends_at' => now()->addDays((int) $request->input('days', 14)),
            ]),
            default => null,
        };

        return response()->json(['success' => true]);
    }

    public function updateReport(Request $request, string $id): JsonResponse
    {
        $report = Report::findOrFail($id);
        $validated = $request->validate(['status' => 'required|in:pending,reviewed,resolved,dismissed']);
        $report->update($validated);
        return response()->json(['success' => true]);
    }

    public function getConfig(): JsonResponse
    {
        $configs = AppConfig::all()->pluck('value', 'key');
        return response()->json(['data' => $configs]);
    }

    public function setConfig(Request $request): JsonResponse
    {
        foreach ($request->all() as $key => $value) {
            AppConfig::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['success' => true]);
    }

    public function templates(): JsonResponse
    {
        // Templates are file-based; return list of template slugs
        $templates = [];
        $dir = base_path('../../frontend/src/lib/templates.ts');
        return response()->json(['data' => $templates]);
    }

    public function updateTemplate(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'is_premium' => 'sometimes|boolean',
        ]);

        // Templates are config-based; store overrides in app_config
        $key = 'template_premium_' . $id;
        AppConfig::updateOrCreate(['key' => $key], ['value' => $validated['is_premium'] ?? false]);

        return response()->json(['success' => true]);
    }
}
