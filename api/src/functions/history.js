const { app } = require("@azure/functions");
const { readBlob, updateBlob, deleteBlob } = require("../blobHelper");

/** Resolve blob name from quiz query param. Backward compat: no param = legacy 'history.json'. */
function historyBlobName(request) {
  const quizId = request.query.get("quiz");
  return quizId ? `history-${quizId}.json` : "history.json";
}

/** Legacy fallback for the original quiz. */
function historyLegacyFallback(request) {
  const quizId = request.query.get("quiz");
  return (quizId === 'colonial-america-ch5-6') ? 'history.json' : null;
}

/**
 * GET /api/history?quiz=<id> — Read quiz attempt history.
 * Falls back to legacy blob for the original Social Studies quiz.
 */
app.http("getHistory", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "history",
  handler: async (request, context) => {
    try {
      let data = await readBlob(historyBlobName(request), []);
      if (data.length === 0) {
        const fallback = historyLegacyFallback(request);
        if (fallback) {
          const legacy = await readBlob(fallback, []);
          if (legacy.length > 0) data = legacy;
        }
      }
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
      if (record.attemptId !== undefined && (typeof record.attemptId !== 'string' || record.attemptId.length > 120)) {
        return { status: 400, jsonBody: { error: 'Invalid attemptId' } };
      }
      const outcome = await updateBlob(historyBlobName(request), [], (history) => {
        if (!Array.isArray(history)) throw new Error('Invalid stored history');
        // Support both new retry IDs and recovery of old browser-only records.
        const duplicate = history.some(existing =>
          (record.attemptId && existing.attemptId === record.attemptId) ||
          (record.timestamp && existing.timestamp === record.timestamp &&
            existing.playerId === record.playerId && existing.section === record.section &&
            existing.score === record.score && existing.total === record.total &&
            (existing.mode || null) === (record.mode || null))
        );
        const result = { ok: true, attemptId: record.attemptId || null, count: history.length + (duplicate ? 0 : 1) };
        return { data: duplicate ? history : [...history, record], result, skipWrite: duplicate };
      });
      return { jsonBody: outcome };
    } catch (e) {
      context.error("Failed to write history:", e.message);
      return { status: 500, jsonBody: { error: "Failed to save history" } };
    }
  },
});

/**
 * DELETE /api/history?quiz=<id> — Delete a quiz's history blob.
 */
app.http("deleteHistory", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "history",
  handler: async (request, context) => {
    try {
      await deleteBlob(historyBlobName(request));
      return { jsonBody: { ok: true } };
    } catch (e) {
      context.error("Failed to delete history:", e.message);
      return { status: 500, jsonBody: { error: "Failed to delete history" } };
    }
  },
});
