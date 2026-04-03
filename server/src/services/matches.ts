import type { Db } from "../db.js";
import type { MatchDto, MatchPlayerDto, MatchSummaryDto, QuestionDto } from "@fb-soccer-quiz/shared";
import { getQuestionById, pickRandomQuestionId, rowToDto } from "./questions.js";

const MAX_ASYNC_PLAYERS = 2;

export async function createSoloMatch(db: Db, playerId: string) {
  const qid = await pickRandomQuestionId(db);
  if (qid === null) throw new Error("No questions in database");

  const [matchId] = await db("matches").insert({
    status: "active",
    context_id: null,
    mode: "solo",
    current_turn_seat: 0,
    round_number: 1,
    current_question_id: qid,
    updated_at: db.fn.now(),
  });

  await db("match_players").insert({
    match_id: matchId,
    fb_player_id: playerId,
    seat: 0,
    score: 0,
  });

  const q = await getQuestionById(db, qid);
  if (!q) throw new Error("Question missing");
  return { matchId: Number(matchId), question: rowToDto(q) };
}

export async function createAsyncMatch(db: Db, playerId: string, contextId: string) {
  const qid = await pickRandomQuestionId(db);
  if (qid === null) throw new Error("No questions in database");

  const [matchId] = await db("matches").insert({
    status: "pending",
    context_id: contextId,
    mode: "async",
    current_turn_seat: 0,
    round_number: 1,
    current_question_id: qid,
    updated_at: db.fn.now(),
  });

  await db("match_players").insert({
    match_id: matchId,
    fb_player_id: playerId,
    seat: 0,
    score: 0,
  });

  const q = await getQuestionById(db, qid);
  if (!q) throw new Error("Question missing");
  return { matchId: Number(matchId), question: rowToDto(q) };
}

export async function joinAsyncMatch(db: Db, matchId: number, playerId: string) {
  const m = await db("matches").where({ id: matchId }).first();
  if (!m) return { error: "Match not found" as const };
  if (m.mode !== "async") return { error: "Not an async match" as const };
  if (m.status === "completed") return { error: "Match finished" as const };

  const players = await db("match_players").where({ match_id: matchId });
  if (players.some((p) => p.fb_player_id === playerId)) {
    return { match: await getMatchDto(db, matchId), question: await getCurrentQuestionDto(db, matchId) };
  }
  if (players.length >= MAX_ASYNC_PLAYERS) return { error: "Match full" as const };

  await db("match_players").insert({
    match_id: matchId,
    fb_player_id: playerId,
    seat: 1,
    score: 0,
  });

  await db("matches")
    .where({ id: matchId })
    .update({ status: "active", updated_at: db.fn.now() });

  return { match: await getMatchDto(db, matchId), question: await getCurrentQuestionDto(db, matchId) };
}

export async function getMatchDto(db: Db, matchId: number): Promise<MatchDto | null> {
  const m = await db("matches").where({ id: matchId }).first();
  if (!m) return null;
  const rows = await db("match_players").where({ match_id: matchId }).orderBy("seat", "asc");
  const players: MatchPlayerDto[] = rows.map((r) => ({
    playerId: r.fb_player_id,
    seat: r.seat === 1 ? 1 : 0,
    score: r.score,
  }));
  return {
    id: m.id,
    status: m.status as MatchDto["status"],
    contextId: m.context_id,
    mode: m.mode as MatchDto["mode"],
    currentTurnSeat:
      m.current_turn_seat === null || m.current_turn_seat === undefined
        ? null
        : (m.current_turn_seat as 0 | 1),
    roundNumber: m.round_number,
    players,
  };
}

async function getCurrentQuestionDto(db: Db, matchId: number): Promise<QuestionDto | null> {
  const m = await db("matches").where({ id: matchId }).first();
  if (!m?.current_question_id) return null;
  const q = await getQuestionById(db, m.current_question_id);
  return q ? rowToDto(q) : null;
}

export async function getMatchState(db: Db, matchId: number) {
  const match = await getMatchDto(db, matchId);
  if (!match) return null;
  const question = await getCurrentQuestionDto(db, matchId);
  return { match, question };
}

export async function listMatchesForPlayer(
  db: Db,
  playerId: string,
  options?: { includeCompleted?: boolean }
): Promise<MatchSummaryDto[]> {
  let q = db("matches")
    .join("match_players", "matches.id", "match_players.match_id")
    .where("match_players.fb_player_id", playerId)
    .select(
      "matches.id",
      "matches.status",
      "matches.mode",
      "matches.context_id"
    )
    .orderBy("matches.updated_at", "desc")
    .limit(50);
  if (!options?.includeCompleted) {
    q = q.whereNot("matches.status", "completed");
  }
  const rows = await q;
  return rows.map((r) => ({
    id: r.id as number,
    status: r.status as MatchSummaryDto["status"],
    mode: r.mode as MatchSummaryDto["mode"],
    contextId: r.context_id as string | null,
  }));
}

export async function submitAnswer(
  db: Db,
  matchId: number,
  playerId: string,
  answerIndex: number
): Promise<
  | {
      correct: boolean;
      score: number;
      match: MatchDto;
      question: QuestionDto | null;
    }
  | { error: string }
> {
  if (answerIndex < 0 || answerIndex > 3 || !Number.isInteger(answerIndex)) {
    return { error: "Invalid answer" };
  }

  const m = await db("matches").where({ id: matchId }).first();
  if (!m) return { error: "Match not found" };
  if (m.status === "completed") return { error: "Match finished" };

  const self = await db("match_players").where({ match_id: matchId, fb_player_id: playerId }).first();
  if (!self) return { error: "Not in this match" };

  if (m.mode === "async" && m.status === "pending") {
    return { error: "Waiting for opponent" };
  }

  const turnSeat = m.current_turn_seat ?? 0;
  if (self.seat !== turnSeat) {
    return { error: "Not your turn" };
  }

  const qid = m.current_question_id;
  if (!qid) return { error: "No active question" };

  const q = await getQuestionById(db, qid);
  if (!q) return { error: "Question missing" };

  const correct = q.correct_index === answerIndex;

  await db("turns").insert({
    match_id: matchId,
    question_id: qid,
    fb_player_id: playerId,
    answer_index: answerIndex,
    is_correct: correct,
  });

  const newScore = self.score + (correct ? 1 : 0);
  await db("match_players").where({ id: self.id }).update({ score: newScore });

  const allPlayers = await db("match_players").where({ match_id: matchId }).orderBy("seat", "asc");
  const numPlayers = allPlayers.length;
  const nextSeat = numPlayers <= 1 ? 0 : turnSeat === 0 ? 1 : 0;

  const nextQid = await pickRandomQuestionId(db);
  const nextRound = m.round_number + 1;

  await db("matches")
    .where({ id: matchId })
    .update({
      current_turn_seat: nextSeat,
      round_number: nextRound,
      current_question_id: nextQid,
      updated_at: db.fn.now(),
    });

  const match = await getMatchDto(db, matchId);
  if (!match) return { error: "Match missing" };

  let nextQuestion: QuestionDto | null = null;
  if (nextQid) {
    const nq = await getQuestionById(db, nextQid);
    if (nq) nextQuestion = rowToDto(nq);
  }

  return {
    correct,
    score: newScore,
    match,
    question: nextQuestion,
  };
}
