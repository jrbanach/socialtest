const { app } = require("@azure/functions");
const { readBlob, writeBlob, deleteBlob } = require("../blobHelper");

/** Resolve blob name from quiz query param. Backward compat: no param = legacy 'questions.json'. */
function questionsBlobName(request) {
  const quizId = request.query.get("quiz");
  return quizId ? `questions-${quizId}.json` : "questions.json";
}

/** Legacy fallback blob name for the original quiz. */
function questionsLegacyFallback(request) {
  const quizId = request.query.get("quiz");
  return (quizId === 'colonial-america-ch5-6') ? 'questions.json' : null;
}

/**
 * GET /api/questions?quiz=<id> — Read quiz questions from blob storage.
 * Falls back to legacy blob name for the original Social Studies quiz.
 * When quiz=_settings, returns raw blob without quiz-shape fallback.
 */
app.http("getQuestions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "questions",
  handler: async (request, context) => {
    try {
      let data = await readBlob(questionsBlobName(request), null);
      const isSettings = request.query.get("quiz") === "_settings";
      // Skip quiz-shape fallback for settings blobs
      if (!isSettings) {
        // If quiz-specific blob is empty/missing, try legacy fallback
        if (!data || (data.vocab && data.vocab.length === 0)) {
          const fallback = questionsLegacyFallback(request);
          if (fallback) {
            const legacy = await readBlob(fallback, null);
            if (legacy && legacy.vocab && legacy.vocab.length > 0) data = legacy;
          }
        }
      }
      return { jsonBody: data || (isSettings ? null : { vocab: [], mc: [], jeopardy: [] }) };
    } catch (e) {
      context.error("Failed to read questions:", e.message);
      return { status: 500, jsonBody: { error: "Failed to read questions" } };
    }
  },
});

/**
 * PUT /api/questions?quiz=<id>&type=settings — Write updated quiz questions to blob storage.
 * Body: { vocab: [...], mc: [...], jeopardy: [...] }
 * When type=settings, skip quiz-shape validation (stores arbitrary JSON).
 */
app.http("putQuestions", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "questions",
  handler: async (request, context) => {
    try {
      const data = await request.json();
      const isSettings = request.query.get("type") === "settings";
      if (!isSettings && (!data.vocab || !data.mc || !data.jeopardy)) {
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

/**
 * DELETE /api/questions?quiz=<id> — Delete a quiz's questions blob.
 */
app.http("deleteQuestions", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "questions",
  handler: async (request, context) => {
    try {
      await deleteBlob(questionsBlobName(request));
      return { jsonBody: { ok: true } };
    } catch (e) {
      context.error("Failed to delete questions:", e.message);
      return { status: 500, jsonBody: { error: "Failed to delete questions" } };
    }
  },
});
