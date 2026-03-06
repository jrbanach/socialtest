const { app } = require("@azure/functions");
const { readBlob, writeBlob } = require("../blobHelper");

/** Resolve blob name from quiz query param. Backward compat: no param = legacy 'questions.json'. */
function questionsBlobName(request) {
  const quizId = request.query.get("quiz");
  return quizId ? `questions-${quizId}.json` : "questions.json";
}

/**
 * GET /api/questions?quiz=<id> — Read quiz questions from blob storage.
 * Returns the current questions or empty default structure.
 */
app.http("getQuestions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "questions",
  handler: async (request, context) => {
    try {
      const data = await readBlob(questionsBlobName(request), { vocab: [], mc: [], jeopardy: [] });
      return { jsonBody: data };
    } catch (e) {
      context.error("Failed to read questions:", e.message);
      return { status: 500, jsonBody: { error: "Failed to read questions" } };
    }
  },
});

/**
 * PUT /api/questions?quiz=<id> — Write updated quiz questions to blob storage.
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
      await writeBlob(questionsBlobName(request), data);
      return { jsonBody: { ok: true } };
    } catch (e) {
      context.error("Failed to write questions:", e.message);
      return { status: 500, jsonBody: { error: "Failed to save questions" } };
    }
  },
});
