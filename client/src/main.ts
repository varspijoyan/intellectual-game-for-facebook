import "./styles.css";
import { initInstantGame, getAuthHeader, getContextId, notifyTurnAsync } from "./fb/instant.js";
import type { FBInstantAPI } from "./fb/types.js";
import * as api from "./api/client.js";
import { createEmptySession, clearSession, setActiveQuestion } from "./game/state.js";

const appRoot = document.getElementById("app");
if (!appRoot) throw new Error("#app missing");
const shell: HTMLElement = appRoot;

const session = createEmptySession();

let fb: FBInstantAPI | null = null;
let authHeaders: Record<string, string> = {};

function render(html: string) {
  shell.innerHTML = html;
}

function bind(id: string, fn: () => void) {
  document.getElementById(id)?.addEventListener("click", fn);
}

async function boot() {
  render(`<div class="card"><p class="muted">Loading…</p></div>`);
  fb = await initInstantGame();
  authHeaders = await getAuthHeader(fb);
  try {
    const me = await api.apiMe(authHeaders);
    await showHome(me.playerId);
  } catch (e) {
    render(
      `<div class="card error"><h1>API error</h1><p>${(e as Error).message}</p><p class="muted">Start the API (server) and check VITE_API_URL.</p></div>`
    );
  }
}

async function showHome(playerId: string) {
  clearSession(session);
  let matchesHtml = "";
  try {
    const { matches } = await api.listMyMatches(authHeaders);
    if (matches.length > 0) {
      const items = matches
        .map(
          (m) =>
            `<li><span class="muted">#${m.id}</span> ${escapeHtml(m.mode)} · ${escapeHtml(m.status)} 
            <button class="btn link" type="button" data-match-open="${m.id}">Open</button></li>`
        )
        .join("");
      matchesHtml = `<div class="my-matches"><h3>Your active matches</h3><ul class="match-list">${items}</ul></div>`;
    }
  } catch {
    matchesHtml = "";
  }

  render(`
    <div class="card">
      <h1>Soccer Quiz</h1>
      <p class="muted">Player: <strong>${escapeHtml(playerId)}</strong></p>
      ${matchesHtml}
      <div class="actions">
        <button class="btn primary" id="btn-solo">Solo practice</button>
        <button class="btn" id="btn-async">Start async match (context)</button>
      </div>
      <p class="hint">Async: first player creates; share so a friend joins the same chat context.</p>
    </div>
  `);
  bind("btn-solo", runSolo);
  bind("btn-async", runAsyncCreate);
  document.querySelectorAll("[data-match-open]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = Number(el.getAttribute("data-match-open"));
      if (Number.isFinite(id)) void openMatch(id);
    });
  });
}

async function openMatch(id: number) {
  render(`<div class="card"><p>Loading match…</p></div>`);
  try {
    const st = await api.getMatch(authHeaders, id);
    if (!st.question) {
      render(`<div class="card"><p>No question yet. ${escapeHtml(st.match.status)}</p><button class="btn" id="btn-back">Back</button></div>`);
      bind("btn-back", async () => {
        const me = await api.apiMe(authHeaders);
        await showHome(me.playerId);
      });
      return;
    }
    setActiveQuestion(session, id, st.question);
    await playLoop();
  } catch (e) {
    render(`<div class="card error"><p>${escapeHtml((e as Error).message)}</p></div>`);
  }
}

async function runSolo() {
  render(`<div class="card"><p>Starting solo…</p></div>`);
  try {
    const r = await api.startSolo(authHeaders);
    setActiveQuestion(session, r.matchId, r.question);
    await playLoop();
  } catch (e) {
    render(`<div class="card error"><p>${(e as Error).message}</p></div>`);
  }
}

async function runAsyncCreate() {
  render(`<div class="card"><p>Creating match…</p></div>`);
  try {
    const ctx = getContextId(fb);
    const r = await api.createAsyncMatch(authHeaders, ctx);
    setActiveQuestion(session, r.matchId, r.question);
    await notifyTurnAsync(fb, "Your turn — or invite a friend in this chat.");
    await playLoop();
  } catch (e) {
    render(`<div class="card error"><p>${(e as Error).message}</p></div>`);
  }
}

async function playLoop() {
  if (session.matchId === null || !session.question) {
    render(`<div class="card error"><p>No active question</p></div>`);
    return;
  }
  drawQuestion();

  bind("btn-answer-0", () => answer(0));
  bind("btn-answer-1", () => answer(1));
  bind("btn-answer-2", () => answer(2));
  bind("btn-answer-3", () => answer(3));
  bind("btn-home", async () => {
    const me = await api.apiMe(authHeaders);
    await showHome(me.playerId);
  });
  bind("btn-join", async () => {
    const raw = (document.getElementById("join-id") as HTMLInputElement | null)?.value;
    const id = raw ? Number(raw.trim()) : NaN;
    if (!Number.isFinite(id)) return;
    try {
      const r = await api.joinMatch(authHeaders, id);
      let q = r.question;
      if (!q) {
        const st = await api.getMatch(authHeaders, id);
        q = st.question;
      }
      if (!q) {
        alert("Match has no active question yet.");
        return;
      }
      setActiveQuestion(session, id, q);
      await notifyTurnAsync(fb, "Joined match — your turn may be next.");
      await playLoop();
    } catch (e) {
      alert((e as Error).message);
    }
  });
}

function drawQuestion() {
  if (!session.question || session.matchId === null) return;
  const q = session.question;
  const mid = session.matchId;
  const opts = q.options
    .map(
      (t: string, i: number) =>
        `<li><button class="btn opt" id="btn-answer-${i}" type="button">${escapeHtml(t)}</button></li>`
    )
    .join("");
  render(`
    <div class="card">
      <p class="badge">Match #${mid}</p>
      <h2 class="q">${escapeHtml(q.text)}</h2>
      <ol class="opts">${opts}</ol>
      <div class="row">
        <button class="btn ghost" id="btn-home" type="button">Home</button>
      </div>
      <div class="join-box">
        <label>Join async match by ID</label>
        <div class="row">
          <input id="join-id" type="number" placeholder="Match id" />
          <button class="btn" id="btn-join" type="button">Join</button>
        </div>
      </div>
    </div>
  `);
}

async function answer(idx: number) {
  if (session.matchId === null) return;
  const mid = session.matchId;
  render(`<div class="card"><p>Checking…</p></div>`);
  try {
    const r = await api.submitAnswer(authHeaders, mid, idx);
    const nextQ = r.question;
    const msg = r.correct ? "Correct!" : "Not quite.";
    if (!nextQ) {
      render(
        `<div class="card"><p>${msg}</p><p class="muted">Score: ${r.score}</p><p>No further question loaded.</p><button class="btn primary" id="btn-home">Home</button></div>`
      );
      bind("btn-home", async () => {
        const me = await api.apiMe(authHeaders);
        await showHome(me.playerId);
      });
      return;
    }
    session.question = nextQ;
    render(
      `<div class="card"><p><strong>${msg}</strong> Score: ${r.score}</p><p class="muted">Next question…</p></div>`
    );
    await new Promise((res) => setTimeout(res, 450));
    await notifyTurnAsync(fb, "Next question is ready.");
    await playLoop();
  } catch (e) {
    const err = (e as Error).message;
    if (err.includes("Not your turn") || err.includes("Waiting")) {
      render(
        `<div class="card"><p class="muted">${escapeHtml(err)}</p><button class="btn" id="btn-refresh">Refresh state</button><button class="btn ghost" id="btn-home2">Home</button></div>`
      );
      bind("btn-refresh", async () => {
        if (session.matchId === null) return;
        const st = await api.getMatch(authHeaders, session.matchId);
        if (st.question) session.question = st.question;
        await playLoop();
      });
      bind("btn-home2", async () => {
        const me = await api.apiMe(authHeaders);
        await showHome(me.playerId);
      });
      return;
    }
    render(`<div class="card error"><p>${escapeHtml(err)}</p></div>`);
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

boot().catch(console.error);
