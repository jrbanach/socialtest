const { app } = require("@azure/functions");
const { readBlob, writeBlob } = require("../blobHelper");

/**
 * GET /api/history — Read all quiz attempt history.
 * Returns array of attempt records.
 */
app.http("getHistory", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "history",
  handler: async (request, context) => {
    try {
      const data = await readBlob("history.json", []);
      return { jsonBody: data };
    } catch (e) {
      context.error("Failed to read history:", e.message);
      return { status: 500, jsonBody: { error: "Failed to read history" } };
    }
  },
});

/**
 * POST /api/history — Append a new quiz attempt record.
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
      const history = await readBlob("history.json", []);
      history.push(record);
      await writeBlob("history.json", history);
      return { jsonBody: { ok: true, count: history.length } };
    } catch (e) {
      context.error("Failed to write history:", e.message);
      return { status: 500, jsonBody: { error: "Failed to save history" } };
    }
  },
});
