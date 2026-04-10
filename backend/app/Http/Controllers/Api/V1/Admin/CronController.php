<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\StorageUsage;
use Aws\S3\S3Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CronController extends Controller
{
    private function r2Client(): S3Client
    {
        return new S3Client([
            'version' => 'latest',
            'region' => 'auto',
            'endpoint' => config('services.r2.endpoint'),
            'credentials' => [
                'key' => config('services.r2.key'),
                'secret' => config('services.r2.secret'),
            ],
        ]);
    }

    public function cleanupMedia(Request $request): JsonResponse
    {
        $secret = $request->header('X-Cron-Secret') ?? $request->query('secret');
        if ($secret !== config('services.cron.secret')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $bucket = config('services.r2.bucket');
        if (!$bucket) {
            return response()->json(['skipped' => true, 'reason' => 'R2 not configured']);
        }

        $cutoff = now()->subDays(30);
        $orphaned = StorageUsage::whereNull('portfolio_id')
            ->where('created_at', '<', $cutoff)
            ->get();

        $deleted = 0;
        $r2 = $this->r2Client();

        foreach ($orphaned as $file) {
            try {
                $r2->deleteObject(['Bucket' => $bucket, 'Key' => $file->file_key]);
                $file->delete();
                $deleted++;
            } catch (\Exception $e) {
                logger()->warning("Failed to delete {$file->file_key}: " . $e->getMessage());
            }
        }

        return response()->json(['deleted' => $deleted]);
    }
}
