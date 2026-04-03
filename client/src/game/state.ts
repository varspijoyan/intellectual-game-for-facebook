import type { QuestionDto } from "@fb-soccer-quiz/shared";

/** In-memory UI session for the current quiz screen */
export interface GameSession {
  matchId: number | null;
  question: QuestionDto | null;
}

export function createEmptySession(): GameSession {
  return { matchId: null, question: null };
}

export function setActiveQuestion(session: GameSession, matchId: number, question: QuestionDto): void {
  session.matchId = matchId;
  session.question = question;
}

export function clearSession(session: GameSession): void {
  session.matchId = null;
  session.question = null;
}
