import type { FBInstantAPI } from "./types.js";

export async function initInstantGame(): Promise<FBInstantAPI | null> {
  const FBInstant = window.FBInstant;
  if (!FBInstant) return null;
  await FBInstant.initializeAsync();
  await FBInstant.startGameAsync();
  return FBInstant;
}

export async function getAuthHeader(fb: FBInstantAPI | null): Promise<Record<string, string>> {
  if (!fb) {
    const devId = import.meta.env.VITE_DEV_PLAYER_ID ?? "dev-player-local";
    return {
      "X-Dev-Player-Id": devId,
    };
  }
  const player = await fb.getPlayerAsync();
  const signed = await player.getSignedPlayerInfoAsync();
  return {
    Authorization: `Bearer ${signed}`,
  };
}

export function getContextId(fb: FBInstantAPI | null): string {
  if (!fb) return "local-context";
  try {
    return fb.context.getID() || "default";
  } catch {
    return "default";
  }
}

export async function notifyTurnAsync(fb: FBInstantAPI | null, text: string): Promise<void> {
  if (!fb) return;
  try {
    await fb.updateAsync({
      action: "CUSTOM",
      data: JSON.stringify({ message: text }),
    });
  } catch {
    /* optional */
  }
}
