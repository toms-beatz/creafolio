<?php

use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\Admin\CronController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\PortfolioController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use App\Http\Controllers\Api\V1\SupportController;
use App\Http\Controllers\Api\V1\TestimonialController;
use App\Http\Controllers\Api\V1\UsernameController;
use Illuminate\Support\Facades\Route;

// Health
Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));

// Stripe webhook (no auth, signature-verified)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->withoutMiddleware('throttle');

// Cron (secret-protected, not auth:sanctum)
Route::get('/cron/cleanup-media', [CronController::class, 'cleanupMedia']);

// Testimonials — GET is public, POST requires auth
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::post('/testimonials', [TestimonialController::class, 'store'])->middleware('auth:sanctum');

// Public portfolio/profile
Route::get('/profiles/{username}', [ProfileController::class, 'show']);
Route::get('/portfolios/by-slug/{slug}', [PortfolioController::class, 'showBySlug']);

// Report (public, rate-limited)
Route::post('/report', [ReportController::class, 'store'])->middleware('throttle:10,10');

// Support — POST is public (guests can contact support)
Route::post('/support', [SupportController::class, 'store'])->middleware('throttle:5,60');

Route::prefix('v1')->group(function () {
    // Public analytics (bot-filtered) — using v1 prefix to match NEXT_PUBLIC_API_URL
    Route::post('/analytics/track', [AnalyticsController::class, 'track'])->middleware('throttle:60,1');
    Route::post('/analytics/click', [AnalyticsController::class, 'click'])->middleware('throttle:60,1');

    // Auth
    Route::prefix('auth')->group(function () {
        Route::middleware('throttle:auth')->group(function () {
            Route::post('/register', [AuthController::class, 'register']);
            Route::post('/login', [AuthController::class, 'login']);
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        });
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/logout/all', [AuthController::class, 'logoutAll']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::patch('/password', [AuthController::class, 'updatePassword']);
            Route::delete('/account', [AuthController::class, 'deleteAccount']);
        });
    });

    // Username check (auth optional — checks if different from current user)
    Route::get('/username/check', [UsernameController::class, 'check']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Portfolios
        Route::get('/portfolios/slug/check', [PortfolioController::class, 'checkSlug']);
        Route::apiResource('portfolios', PortfolioController::class);

        // Profile
        Route::get('/profile', [ProfileController::class, 'me']);
        Route::patch('/profile', [ProfileController::class, 'update']);

        // Media
        Route::get('/media', [MediaController::class, 'index']);
        Route::get('/media/storage', [MediaController::class, 'storage']);
        Route::post('/media/upload', [MediaController::class, 'upload']);
        Route::patch('/media/{id}', [MediaController::class, 'rename']);
        Route::delete('/media/{id}', [MediaController::class, 'destroy']);

        // Billing
        Route::post('/billing/checkout', [BillingController::class, 'checkout']);
        Route::post('/billing/portal', [BillingController::class, 'portal']);

        // Analytics reads
        Route::get('/analytics/{portfolioId}/summary', [AnalyticsController::class, 'summary']);
        Route::get('/analytics/{portfolioId}/referrers', [AnalyticsController::class, 'referrers']);
        Route::get('/analytics/{portfolioId}/clicks', [AnalyticsController::class, 'linkClicks']);
        Route::get('/analytics/{portfolioId}/export', [AnalyticsController::class, 'export']);
        Route::get('/analytics/{portfolioId}/visitors', [AnalyticsController::class, 'visitors']);

        // Support (authenticated)
        Route::get('/support/tickets', [SupportController::class, 'index']);
        Route::post('/support/tickets', [SupportController::class, 'store']);
        Route::get('/support/tickets/{id}', [SupportController::class, 'show']);
        Route::post('/support/tickets/{id}/messages', [SupportController::class, 'addMessage']);
        Route::patch('/support/tickets/{id}/status', [SupportController::class, 'updateStatus']);

        // Admin
        Route::middleware('can:admin')->prefix('admin')->group(function () {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::get('/reports', [AdminController::class, 'reports']);
            Route::get('/storage/debug', [AdminController::class, 'debugStorage']);
            Route::post('/storage/backfill', [AdminController::class, 'backfillStorage']);
            Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
            Route::get('/portfolios', [AdminController::class, 'portfolios']);
            Route::patch('/portfolios/{id}', [AdminController::class, 'updatePortfolio']);
            Route::delete('/portfolios/{id}', [AdminController::class, 'destroyPortfolio']);
            Route::patch('/reports/{id}', [AdminController::class, 'updateReport']);
            Route::get('/config', [AdminController::class, 'getConfig']);
            Route::post('/config', [AdminController::class, 'setConfig']);
            Route::get('/testimonials', [AdminController::class, 'testimonials']);
            Route::patch('/testimonials/{id}', [AdminController::class, 'approveTestimonial']);
            Route::get('/support', [AdminController::class, 'supportTickets']);
            Route::get('/support/{id}', [AdminController::class, 'supportTicketShow']);
            Route::patch('/support/{id}', [AdminController::class, 'updateTicket']);
            Route::post('/support/{id}/messages', [AdminController::class, 'addAdminMessage']);
            Route::get('/templates', [AdminController::class, 'templates']);
            Route::patch('/templates/{id}', [AdminController::class, 'updateTemplate']);
        });
    });
});
