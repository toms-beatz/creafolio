<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject'     => 'required|string|min:5|max:200',
            'category'    => 'required|string|in:billing,technical,account,feature,other,technique,general,autre',
            'message'     => 'required|string|min:10|max:5000',
            'guest_email' => 'nullable|email',
            'guest_name'  => 'nullable|string|max:100',
        ]);

        $user     = $request->user();
        $ticketId = Str::uuid()->toString();

        $ticket = SupportTicket::create([
            'id'          => $ticketId,
            'user_id'     => $user?->id,
            'guest_email' => $user ? null : $validated['guest_email'] ?? null,
            'guest_name'  => $user ? null : ($validated['guest_name'] ?? null),
            'subject'     => $validated['subject'],
            'category'    => $validated['category'],
            'status'      => 'open',
            'priority'    => 'normal',
        ]);

        SupportMessage::create([
            'id'          => Str::uuid(),
            'ticket_id'   => $ticket->id,
            'sender_type' => $user ? 'user' : 'guest',
            'sender_id'   => $user?->id,
            'content'     => $validated['message'],
            'is_internal' => false,
        ]);

        return response()->json(['data' => ['ticket_id' => $ticket->id]], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $tickets = SupportTicket::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $tickets]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::with('messages')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json(['data' => $ticket]);
    }

    public function addMessage(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (in_array($ticket->status, ['closed', 'resolved'])) {
            return response()->json(['error' => 'Ticket fermé.'], 403);
        }

        $validated = $request->validate(['message' => 'required|string|min:2|max:5000']);

        SupportMessage::create([
            'id'          => Str::uuid(),
            'ticket_id'   => $ticket->id,
            'sender_type' => 'user',
            'sender_id'   => $request->user()->id,
            'content'     => $validated['message'],
            'is_internal' => false,
        ]);

        $ticket->update(['status' => 'waiting_admin']);

        return response()->json(['success' => true]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:resolved,closed',
        ]);

        $ticket->update([
            'status'      => $validated['status'],
            'resolved_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}
