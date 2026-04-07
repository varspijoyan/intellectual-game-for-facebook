import crypto from "node:crypto";

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

export function verifySignedPlayerInfo(signedPlayerInfo) {
  const appSecret = process.env.FB_SECRET;
  if (!appSecret) throw new Error("FB_SECRET is missing");

  if (!signedPlayerInfo || !String(signedPlayerInfo).includes(".")) {
    throw new Error("Invalid signed_player_info format");
  }

  const [encodedSignature, encodedPayload] = String(signedPlayerInfo).split(".");
  const expectedSig = crypto.createHmac("sha256", appSecret).update(encodedPayload).digest("base64url");

  if (expectedSig !== encodedSignature) {
    throw new Error("Invalid signed_player_info signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  return payload;
}

export async function getFacebookFriends(accessToken) {
  const version = process.env.FB_GRAPH_API_VERSION || "v20.0";
  const response = await fetch(
    `https://graph.facebook.com/${version}/me/friends?access_token=${encodeURIComponent(accessToken)}`,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Graph API error: ${response.status} ${errorText}`);
  }
  return response.json();
}
