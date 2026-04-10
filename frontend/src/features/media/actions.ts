"use server";

import { revalidatePath } from "next/cache";
import { api, apiUpload } from "@/lib/api-server";

export interface MediaFile {
  id: string;
  file_key: string;
  url: string;
  file_size: number;
  mime_type: string | null;
  display_name: string | null;
  portfolio_id: number | null;
  created_at: string;
}

export interface StorageFile {
  id: string;
  fileKey: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  portfolioId: string | null;
  displayName: string | null;
  createdAt: string;
}

export async function getMediaFiles(
  portfolioId?: string,
): Promise<MediaFile[]> {
  try {
    const suffix = portfolioId ? `?portfolio_id=${portfolioId}` : "";
    const data = await api.get<{ data: MediaFile[] }>(`/v1/media${suffix}`);
    return data.data;
  } catch {
    return [];
  }
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<{ url?: string; error?: string; file?: MediaFile }> {
  try {
    const res = await apiUpload("/v1/media/upload", formData);
    if (!res.ok) {
      const err = await res.json();
      return { error: err.message ?? "Upload échoué." };
    }
    const data = await res.json();
    revalidatePath("/dashboard/media");
    return { url: data.data.url, file: data.data };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function renameMediaAction(
  id: string,
  displayName: string,
): Promise<{ error?: string }> {
  try {
    await api.patch(`/v1/media/${id}`, { display_name: displayName });
    revalidatePath("/dashboard/media");
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function deleteMediaAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await api.delete(`/v1/media/${id}`);
    revalidatePath("/dashboard/media");
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function getStorageUsage(): Promise<{
  used: number;
  limit: number;
  quota: number;
  totalBytes: number;
  files: StorageFile[];
}> {
  try {
    const data = await (
      await import("@/lib/api-server")
    ).api.get<{
      used: number;
      limit: number;
      files?: Array<{
        id: string;
        file_key: string;
        url: string;
        file_name?: string;
        file_size: number;
        mime_type?: string | null;
        portfolio_id?: string | null;
        display_name?: string | null;
        created_at: string;
      }>;
    }>("/v1/media/storage");
    const files: StorageFile[] = (data.files ?? []).map((f) => ({
      id: f.id,
      fileKey: f.file_key,
      url: f.url,
      fileName: f.file_name ?? f.file_key,
      fileSize: f.file_size,
      mimeType: f.mime_type ?? null,
      portfolioId: f.portfolio_id ?? null,
      displayName: f.display_name ?? null,
      createdAt: f.created_at,
    }));
    return {
      used: data.used,
      limit: data.limit,
      quota: data.limit,
      totalBytes: data.used,
      files,
    };
  } catch {
    return { used: 0, limit: 0, quota: 0, totalBytes: 0, files: [] };
  }
}

export async function checkFileUsedInPortfolios(
  fileKey: string,
): Promise<string[]> {
  try {
    const data = await (
      await import("@/lib/api-server")
    ).api.get<{ used: boolean; portfolios?: string[] }>(
      `/v1/media/check?key=${encodeURIComponent(fileKey)}`,
    );
    return data.portfolios ?? (data.used ? ["un portfolio"] : []);
  } catch {
    return [];
  }
}
