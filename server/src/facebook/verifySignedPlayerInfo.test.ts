import assert from "node:assert";
import crypto from "node:crypto";
import test from "node:test";
import { verifySignedPlayerInfo } from "./verifySignedPlayerInfo.js";

/** Build a string that passes our verifier (same layout as Instant Games signed payloads). */
function makeSigned(playerID: string, secret: string): string {
  const payloadJson = JSON.stringify({ playerID });
  const payload = Buffer.from(payloadJson)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  const encodedSig = expected
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${encodedSig}.${payload}`;
}

test("verifySignedPlayerInfo accepts valid payload", () => {
  const secret = "test-app-secret";
  const signed = makeSigned("player-abc", secret);
  const r = verifySignedPlayerInfo(signed, secret);
  assert.deepStrictEqual(r, { playerID: "player-abc" });
});

test("verifySignedPlayerInfo rejects wrong secret", () => {
  const signed = makeSigned("player-abc", "a");
  assert.strictEqual(verifySignedPlayerInfo(signed, "b"), null);
});

test("verifySignedPlayerInfo rejects malformed string", () => {
  assert.strictEqual(verifySignedPlayerInfo("no-dot", "x"), null);
});
