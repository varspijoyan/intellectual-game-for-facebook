import crypto from "node:crypto";

export interface SignedPlayerPayload {
  playerID: string;
}

/**
 * Verifies Instant Games signed player info (format: base64url(sig).base64url(payload)).
 * @see https://developers.facebook.com/docs/games/instant-games/sdk/fbinstant6.3
 */
export function verifySignedPlayerInfo(
  signedPlayerInfo: string,
  appSecret: string
): SignedPlayerPayload | null {
  if (!signedPlayerInfo || !appSecret) return null;
  const parts = signedPlayerInfo.split(".");
  if (parts.length !== 2) return null;
  const [encodedSig, payload] = parts;
  let sig: Buffer;
  try {
    sig = Buffer.from(base64UrlToBase64(encodedSig), "base64");
  } catch {
    return null;
  }
  const expected = crypto.createHmac("sha256", appSecret).update(payload).digest();
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) {
    return null;
  }
  let data: unknown;
  try {
    const json = Buffer.from(base64UrlToBase64(payload), "base64").toString("utf8");
    data = JSON.parse(json) as unknown;
  } catch {
    return null;
  }
  if (
    typeof data !== "object" ||
    data === null ||
    !("playerID" in data) ||
    typeof (data as { playerID?: unknown }).playerID !== "string"
  ) {
    return null;
  }
  return { playerID: (data as SignedPlayerPayload).playerID };
}

function base64UrlToBase64(s: string): string {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return b64;
}
