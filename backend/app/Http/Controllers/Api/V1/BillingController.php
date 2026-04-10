<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Customer;

class BillingController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'price_id' => 'required|string',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url',
        ]);

        $user = $request->user();
        $profile = $user->profile;
        $customerId = $this->getOrCreateStripeCustomer($user, $profile);

        $session = CheckoutSession::create([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $validated['price_id'],
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => $validated['success_url'],
            'cancel_url' => $validated['cancel_url'],
            'allow_promotion_codes' => true,
            'metadata' => ['user_id' => $user->id],
        ]);

        return response()->json(['url' => $session->url]);
    }

    public function portal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'return_url' => 'required|url',
        ]);

        $user = $request->user();
        $profile = $user->profile;

        if (!$profile?->stripe_customer_id) {
            return response()->json(['message' => 'No active subscription'], 404);
        }

        $session = PortalSession::create([
            'customer' => $profile->stripe_customer_id,
            'return_url' => $validated['return_url'],
        ]);

        return response()->json(['url' => $session->url]);
    }

    private function getOrCreateStripeCustomer($user, $profile): string
    {
        if ($profile?->stripe_customer_id) {
            return $profile->stripe_customer_id;
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => ['user_id' => $user->id],
        ]);

        if ($profile) {
            $profile->update(['stripe_customer_id' => $customer->id]);
        }

        return $customer->id;
    }
}
