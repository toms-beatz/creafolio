<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsernameController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|min:3|max:30|regex:/^[a-z0-9_-]+$/',
        ]);

        $username = strtolower($request->input('username'));

        $reserved = ['admin', 'api', 'support', 'help', 'login', 'signup',
            'register', 'logout', 'settings', 'dashboard', 'builder',
            'pricing', 'preview', 'legal', 'guide', 'blooprint'];

        if (in_array($username, $reserved)) {
            return response()->json(['available' => false, 'reason' => 'reserved']);
        }

        $exists = Profile::where('username', $username)
            ->when($request->user(), fn($q) => $q->where('id', '!=', $request->user()->id))
            ->exists();

        return response()->json(['available' => !$exists]);
    }
}
