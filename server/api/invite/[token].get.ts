import crypto from "node:crypto";
import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  if (!token) {
    throw createError({ statusCode: 400, message: "Missing token" });
  }

  const config = useRuntimeConfig(event);
  const secret = (config.inviteSecret as string) || "keepr-dev-invite-secret";

  // Token format: base64url(collectionId.expiresAt).hmacSignature
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) {
    throw createError({ statusCode: 400, message: "Invalid token" });
  }

  const encodedPayload = token.substring(0, lastDot);
  const signature = token.substring(lastDot + 1);

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  } catch {
    throw createError({ statusCode: 400, message: "Invalid token" });
  }

  // Verify HMAC
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (signature !== expectedSignature) {
    throw createError({ statusCode: 400, message: "Invalid token" });
  }

  // Parse payload: collectionId.expiresAt
  const dotIndex = payload.indexOf(".");
  if (dotIndex === -1) {
    throw createError({ statusCode: 400, message: "Invalid token" });
  }

  const collectionId = payload.substring(0, dotIndex);
  const expiresAt = parseInt(payload.substring(dotIndex + 1), 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    throw createError({ statusCode: 400, message: "Token expired" });
  }

  // Fetch collection name using service role (bypasses RLS)
  const supabase = serverSupabaseServiceRole(event);
  const { data: collection, error } = await supabase
    .from("collections")
    .select("name")
    .eq("id", collectionId)
    .single();

  if (error || !collection) {
    throw createError({ statusCode: 404, message: "Collection not found" });
  }

  return { valid: true, collectionId, collectionName: collection.name };
});
