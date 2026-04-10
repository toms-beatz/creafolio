<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Event;
use Stripe\Stripe;
use Stripe\WebhookSignature;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response('Invalid signature', 400);
        }

        $eventId = $event->id;

        match ($event->type) {
            'customer.subscription.created',
            'customer.subscription.updated' => $this->handleSubscriptionUpsert($event, $eventId),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event, $eventId),
            'checkout.session.completed' => $this->handleCheckoutCompleted($event, $eventId),
            default => null,
        };

        return response('OK', 200);
    }

    private function handleSubscriptionUpsert(Event $event, string $eventId): void
    {
        $sub = $event->data->object;
        $customerId = $sub->customer;
        $profile = Profile::where('stripe_customer_id', $customerId)->first();
        if (!$profile) return;

        $existingSub = Subscription::where('stripe_subscription_id', $sub->id)->first();
        if ($existingSub) {
            $existingEvents = $existingSub->stripe_event_ids ?? [];
            if (in_array($eventId, $existingEvents)) return;
            $existingEvents[] = $eventId;
            $existingSub->update([
                'stripe_price_id' => $sub->items->data[0]->price->id,
                'status' => $sub->status,
                'current_period_start' => date('Y-m-d H:i:s', $sub->current_period_start),
                'current_period_end' => date('Y-m-d H:i:s', $sub->current_period_end),
                'cancel_at_period_end' => $sub->cancel_at_period_end,
                'canceled_at' => $sub->canceled_at ? date('Y-m-d H:i:s', $sub->canceled_at) : null,
                'stripe_event_ids' => $existingEvents,
            ]);
        } else {
            Subscription::create([
                'id' => Str::uuid(),
                'user_id' => $profile->id,
                'stripe_subscription_id' => $sub->id,
                'stripe_price_id' => $sub->items->data[0]->price->id,
                'stripe_product_id' => $sub->items->data[0]->price->product,
                'status' => $sub->status,
                'current_period_start' => date('Y-m-d H:i:s', $sub->current_period_start),
                'current_period_end' => date('Y-m-d H:i:s', $sub->current_period_end),
                'cancel_at_period_end' => $sub->cancel_at_period_end,
                'trial_start' => $sub->trial_start ? date('Y-m-d H:i:s', $sub->trial_start) : null,
                'trial_end' => $sub->trial_end ? date('Y-m-d H:i:s', $sub->trial_end) : null,
                'stripe_event_ids' => [$eventId],
            ]);
        }

        $isActive = in_array($sub->status, ['active', 'trialing']);
        if ($profile) {
            $profile->update(['plan' => $isActive ? 'premium' : 'free']);
        }
    }

    private function handleSubscriptionDeleted(Event $event, string $eventId): void
    {
        $sub = $event->data->object;
        $existing = Subscription::where('stripe_subscription_id', $sub->id)->first();
        if ($existing) {
            $existing->update(['status' => 'canceled', 'ended_at' => now()]);
        }
        $profile = Profile::where('stripe_customer_id', $sub->customer)->first();
        if ($profile) {
            $profile->update(['plan' => 'free']);
        }
    }

    private function handleCheckoutCompleted(Event $event, string $eventId): void
    {
        $session = $event->data->object;
        if ($session->mode !== 'subscription') return;

        $userId = $session->metadata->user_id ?? null;
        if (!$userId) return;

        $user = User::find($userId);
        $profile = $user?->profile;
        if ($profile && !$profile->stripe_customer_id) {
            $profile->update(['stripe_customer_id' => $session->customer]);
        }
    }
}
