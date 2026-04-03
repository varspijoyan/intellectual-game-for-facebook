import type { MatchDto, MatchSummaryDto, QuestionDto } from "@fb-soccer-quiz/shared";

const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000";

async function request<T>(
  path: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err?.error ?? res.statusText);
  }
  return data as T;
}

export async function apiMe(headers: Record<string, string>) {
  return request<{ playerId: string }>("/api/me", { headers });
}

export async function listMyMatches(headers: Record<string, string>) {
  return request<{ matches: MatchSummaryDto[] }>("/api/matches", { headers });
}

export async function startSolo(headers: Record<string, string>) {
  return request<{ matchId: number; match: MatchDto; question: QuestionDto }>("/api/matches/solo", {
    method: "POST",
    headers,
  });
}

export async function createAsyncMatch(headers: Record<string, string>, contextId: string) {
  return request<{ matchId: number; match: MatchDto; question: QuestionDto }>("/api/matches/async", {
    method: "POST",
    headers,
    body: JSON.stringify({ contextId }),
  });
}

export async function joinMatch(headers: Record<string, string>, matchId: number) {
  return request<{ match: MatchDto; question: QuestionDto | null }>(`/api/matches/${matchId}/join`, {
    method: "POST",
    headers,
  });
}

export async function getMatch(headers: Record<string, string>, matchId: number) {
  return request<{ match: MatchDto; question: QuestionDto | null }>(`/api/matches/${matchId}`, {
    headers,
  });
}

export async function submitAnswer(headers: Record<string, string>, matchId: number, answerIndex: number) {
  return request<{
    correct: boolean;
    score: number;
    match: MatchDto;
    question: QuestionDto | null;
  }>(`/api/matches/${matchId}/answer`, {
    method: "POST",
    headers,
    body: JSON.stringify({ answerIndex }),
  });
}
