export interface FBInstantPlayer {
  getID(): string;
  getName(): string;
  getPhoto(): string;
  getSignedPlayerInfoAsync(): Promise<string>;
}

export interface FBInstantContext {
  getID(): string;
  getType(): string;
}

export interface FBInstantAPI {
  initializeAsync(): Promise<void>;
  startGameAsync(): Promise<void>;
  getPlayerAsync(): Promise<FBInstantPlayer>;
  context: FBInstantContext;
  updateAsync(payload: { action: string; data?: string }): Promise<void>;
}

declare global {
  interface Window {
    FBInstant?: FBInstantAPI;
  }
}

export {};
