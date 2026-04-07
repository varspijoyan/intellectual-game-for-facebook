export function health(_req, res) {
  res.json({ ok: true, service: "soccer-quiz-backend", timestamp: new Date().toISOString() });
}
