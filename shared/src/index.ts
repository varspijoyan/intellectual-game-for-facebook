export type MatchStatus = "pending" | "active" | "completed";

export interface MatchSummaryDto {
  id: number;
  status: MatchStatus;
  mode: "solo" | "async";
  contextId: string | null;
}

export interface QuestionDto {
  id: number;
  text: string;
  options: [string, string, string, string];
}

export interface QuestionWithAnswer extends QuestionDto {
  correctIndex: number;
}

export interface MatchPlayerDto {
  playerId: string;
  seat: 0 | 1;
  score: number;
}

export interface MatchDto {
  id: number;
  status: MatchStatus;
  contextId: string | null;
  mode: "solo" | "async";
  currentTurnSeat: 0 | 1 | null;
  roundNumber: number;
  players: MatchPlayerDto[];
}

export interface MeResponse {
  playerId: string;
}
