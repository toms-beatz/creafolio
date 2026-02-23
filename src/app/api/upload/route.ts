import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

/**
 * POST /api/upload
 * Upload une image vers Cloudflare R2. Retourne l'URL publique.
 * EPIC 16 — US-1602
 *
 * Body: FormData avec :
 *   - file: File
 *   - portfolioId: string
 */
export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Parse formData
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const portfolioId = (formData.get("portfolioId") as string | null) ?? "misc";

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  // Validation type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté. Utilise JPG, PNG, WebP ou GIF." },
      { status: 400 },
    );
  }

  // Validation taille
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop lourd (max 5 Mo)." },
      { status: 400 },
    );
  }

  // Vérifier variables R2
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKey || !secretKey || !bucketName || !publicUrl) {
    console.error("[upload] Missing R2 env vars");
    return NextResponse.json(
      { error: "Service de stockage non configuré." },
      { status: 503 },
    );
  }

  // Générer la clé unique
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileKey = `uploads/${user.id}/${portfolioId}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  // Upload vers R2
  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
        ContentLength: buffer.length,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (err) {
    console.error("[upload] R2 error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'upload." },
      { status: 500 },
    );
  }

  // Enregistrer l'usage en base (quota tracking)
  await supabase.from("storage_usage").insert({
    user_id: user.id,
    portfolio_id: portfolioId !== "misc" ? portfolioId : null,
    file_key: fileKey,
    file_size: file.size,
    mime_type: file.type,
  });

  const url = `${publicUrl.replace(/\/$/, "")}/${fileKey}`;
  return NextResponse.json({ url, key: fileKey }, { status: 201 });
}
