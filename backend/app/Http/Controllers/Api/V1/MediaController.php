<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StorageUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    private function r2Configured(): bool
    {
        return (bool) config('services.r2.endpoint');
    }

    private function r2Client(): object
    {
        // Dynamic instantiation avoids a hard class-import on aws/aws-sdk-php
        // when the package is not installed (local-only dev environment).
        $class = 'Aws\\S3\\S3Client';
        return new $class([
            'version' => 'latest',
            'region' => 'auto',
            'endpoint' => config('services.r2.endpoint'),
            'credentials' => [
                'key' => config('services.r2.key'),
                'secret' => config('services.r2.secret'),
            ],
        ]);
    }

    private function fileUrl(string $fileKey): string
    {
        if ($this->r2Configured()) {
            return config('services.r2.public_url') . '/' . $fileKey;
        }
        return config('app.url') . '/storage/' . $fileKey;
    }

    public function storage(Request $request): JsonResponse
    {
        $user  = $request->user();
        $files = StorageUsage::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $used  = $files->sum('file_size');
        // 500 MB free / 5 GB premium or admin
        $isAdmin   = $user->profile?->role === 'admin';
        $isPremium = $isAdmin || in_array($user->profile?->plan ?? 'free', ['premium', 'trial']);
        $limit = $isPremium
            ? 5 * 1024 * 1024 * 1024
            : 500 * 1024 * 1024;

        return response()->json([
            'used'  => $used,
            'limit' => $limit,
            'files' => $files->map(fn($f) => [
                'id'           => $f->id,
                'file_key'     => $f->file_key,
                'url'          => $this->fileUrl($f->file_key),
                'file_name'    => $f->display_name ?? basename($f->file_key),
                'file_size'    => $f->file_size,
                'mime_type'    => $f->mime_type,
                'display_name' => $f->display_name,
                'portfolio_id' => $f->portfolio_id,
                'created_at'   => $f->created_at,
            ]),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $files = StorageUsage::where('user_id', $request->user()->id)
            ->when($request->input('portfolio_id'), fn($q, $id) => $q->where('portfolio_id', $id))
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $files->map(fn($f) => [
                'id'           => $f->id,
                'file_key'     => $f->file_key,
                'url'          => $this->fileUrl($f->file_key),
                'file_size'    => $f->file_size,
                'mime_type'    => $f->mime_type,
                'display_name' => $f->display_name,
                'portfolio_id' => $f->portfolio_id,
                'created_at'   => $f->created_at,
            ]),
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file'         => 'required|file|max:10240',
            'portfolio_id' => 'nullable|integer|min:1|exists:portfolios,id',
        ]);

        $user    = $request->user();
        $file    = $request->file('file');
        $ext     = $file->getClientOriginalExtension();
        $fileKey = 'users/' . $user->id . '/' . Str::uuid() . '.' . $ext;

        if ($this->r2Configured()) {
            $r2 = $this->r2Client();
            $r2->putObject([
                'Bucket'      => config('services.r2.bucket'),
                'Key'         => $fileKey,
                'Body'        => $file->getContent(),
                'ContentType' => $file->getMimeType(),
            ]);
        } else {
            // Local fallback for dev (no R2 configured)
            Storage::disk('public')->put($fileKey, $file->getContent());
        }

        $record = StorageUsage::create([
            'id'           => Str::uuid(),
            'user_id'      => $user->id,
            'portfolio_id' => $request->input('portfolio_id'),
            'file_key'     => $fileKey,
            'file_size'    => $file->getSize(),
            'mime_type'    => $file->getMimeType(),
            'display_name' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'data' => [
                'id'        => $record->id,
                'url'       => $this->fileUrl($fileKey),
                'file_key'  => $fileKey,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ],
        ], 201);
    }

    public function rename(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:200',
        ]);

        $file = StorageUsage::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $file->update(['display_name' => $validated['display_name']]);

        return response()->json(['data' => $file]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $file = StorageUsage::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($this->r2Configured()) {
            try {
                $r2 = $this->r2Client();
                $r2->deleteObject([
                    'Bucket' => config('services.r2.bucket'),
                    'Key'    => $file->file_key,
                ]);
            } catch (\Exception $e) {
                logger()->warning('R2 delete failed: ' . $e->getMessage());
            }
        } else {
            Storage::disk('public')->delete($file->file_key);
        }

        $file->delete();
        return response()->json(null, 204);
    }
}
