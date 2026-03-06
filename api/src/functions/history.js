const { app } = require("@azure/functions");
const { readBlob, writeBlob } = require("../blobHelper");

/** Resolve blob name from quiz query param. Backward compat: no param = legacy 'history.json'. */
function historyBlobName(request) {
  const quizId = request.query.get("quiz");
  return quizId ? `history-${quizId}.json` : "history.json";
}

/**
 * GET /api/history?quiz=<id> — Read quiz attempt history.
 * Returns array of attempt records.
 */
app.http("getHistory", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "history",
  handler: async (request, context) => {
    try {
      const data = await readBlob(historyBlobName(request), []);
      return { jsonBody: data };
    } catch (e) {
      context.error("Failed to read history:", e.message);
      return { status: 500, jsonBody: { error: "Failed to read history" } };
    }
  },
});

/**
 * POST /api/history?quiz=<id> — Append a new quiz attempt record.
 * Body: { playerId, playerName, section, mode, score, total, percentage, timestamp, duration }
 */
app.http("postHistory", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "history",
  handler: async (request, context) => {
    try {
      const record = await request.json();
      if (!record.playerId || !record.section || record.score === undefined) {
        return { status: 400, jsonBody: { error: "Record must include playerId, section, and score" } };
      }
      const history = await readBlob(historyBlobName(request), []);
      history.push(record);
      await writeBlob(historyBlobName(request), history);
      return { jsonBody: { ok: true, count: history.length } };
    } catch (e) {
      context.error("Failed to write history:", e.message);
      return { status: 500, jsonBody: { error: "Failed to save history" } };
    }
  },
});
