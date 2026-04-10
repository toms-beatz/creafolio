/**
 * Utilitaires gestion images — US-905
 * Validation taille/format + compression via sharp.
 * Usage: API Routes upload uniquement (serveur).
 */

/** Taille max upload par fichier: 5MB (RG-006) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Seuil de compression: images > 1MB sont compressées */
const COMPRESSION_THRESHOLD_BYTES = 1 * 1024 * 1024;

/** Formats acceptés */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valide taille et format d'un fichier image avant upload.
 */
export function validateImage(file: {
  size: number;
  type: string;
}): ImageValidationResult {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `L'image dépasse la taille maximale de 5MB (taille actuelle: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as AcceptedImageType)) {
    return {
      valid: false,
      error: `Format non supporté. Formats acceptés: JPG, PNG, WebP, GIF`,
    };
  }

  return { valid: true };
}

/**
 * Compresse une image si elle dépasse le seuil (1MB).
 * Retourne le buffer original si en dessous du seuil ou si format GIF.
 * Utilise sharp pour la compression côté serveur.
 */
export async function compressImageIfNeeded(
  buffer: Buffer,
  mimeType: string,
): Promise<Buffer> {
  // Ne pas compresser les GIFs (perte d'animation)
  if (
    mimeType === "image/gif" ||
    buffer.length <= COMPRESSION_THRESHOLD_BYTES
  ) {
    return buffer;
  }

  const sharp = (await import("sharp")).default;

  const isJpeg = mimeType === "image/jpeg" || mimeType === "image/jpg";
  const isPng = mimeType === "image/png";

  if (isJpeg) {
    return sharp(buffer).jpeg({ quality: 82, progressive: true }).toBuffer();
  }

  if (isPng) {
    return sharp(buffer).png({ compressionLevel: 8 }).toBuffer();
  }

  // WebP → recompresser en WebP
  return sharp(buffer).webp({ quality: 82 }).toBuffer();
}

/**
 * Génère le chemin de stockage Supabase Storage pour une image portfolio.
 * Format: `portfolios/{userId}/{portfolioId}/{filename}`
 */
export function buildStoragePath(
  userId: string,
  portfolioId: string,
  filename: string,
): string {
  const ext = filename.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const safename = `${timestamp}.${ext}`;
  return `portfolios/${userId}/${portfolioId}/${safename}`;
}
