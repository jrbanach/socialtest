const { app } = require("@azure/functions");
const { readBlob, writeBlob } = require("../blobHelper");

/**
 * GET /api/questions — Read quiz questions from blob storage.
 * Returns the current questions.json or empty default structure.
 */
app.http("getQuestions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "questions",
  handler: async (request, context) => {
    try {
      const data = await readBlob("questions.json", { vocab: [], mc: [], jeopardy: [] });
      return { jsonBody: data };
    } catch (e) {
      context.error("Failed to read questions:", e.message);
      return { status: 500, jsonBody: { error: "Failed to read questions" } };
    }
  },
});

/**
 * PUT /api/questions — Write updated quiz questions to blob storage.
 * Body: { vocab: [...], mc: [...], jeopardy: [...] }
 */
app.http("putQuestions", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "questions",
  handler: async (request, context) => {
    try {
      const data = await request.json();
      if (!data.vocab || !data.mc || !data.jeopardy) {
        return { status: 400, jsonBody: { error: "Body must include vocab, mc, and jeopardy arrays" } };
      }
      await writeBlob("questions.json", data);
      return { jsonBody: { ok: true } };
    } catch (e) {
      context.error("Failed to write questions:", e.message);
      return { status: 500, jsonBody: { error: "Failed to save questions" } };
    }
  },
});
