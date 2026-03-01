import crypto from "node:crypto";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody<{ collectionId: string }>(event);
  if (!body?.collectionId) {
    throw createError({ statusCode: 400, message: "Missing collectionId" });
  }

  // Verify the requesting user is a member of this collection
  const supabase = await serverSupabaseClient(event);
  const { data: member } = await supabase
    .from("collection_members")
    .select("id")
    .eq("collection_id", body.collectionId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    throw createError({ statusCode: 403, message: "Not a member of this collection" });
  }

  const config = useRuntimeConfig(event);
  // Falls back to a default for local dev — set NUXT_INVITE_SECRET in production
  const secret = (config.inviteSecret as string) || "keepr-dev-invite-secret";

  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${body.collectionId}.${expiresAt}`;
  const encodedPayload = Buffer.from(payload).toString("base64url");

  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");

  const token = `${encodedPayload}.${signature}`;
  const baseUrl = config.public.baseUrl as string;

  return { url: `${baseUrl}/join/${token}` };
});
