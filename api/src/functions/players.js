const { app } = require("@azure/functions");
const { readBlob, writeBlob } = require("../blobHelper");

/**
 * GET /api/players — Read all registered players.
 * Returns array of { id, name, createdAt }.
 */
app.http("getPlayers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "players",
  handler: async (request, context) => {
    try {
      const data = await readBlob("players.json", []);
      return { jsonBody: data };
    } catch (e) {
      context.error("Failed to read players:", e.message);
      return { status: 500, jsonBody: { error: "Failed to read players" } };
    }
  },
});

/**
 * POST /api/players — Register a new player.
 * Body: { name: "string" }
 * Returns the created player record with generated id.
 */
app.http("postPlayers", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "players",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      if (!body.name || !body.name.trim()) {
        return { status: 400, jsonBody: { error: "Player name is required" } };
      }
      const players = await readBlob("players.json", []);
      const player = {
        id: crypto.randomUUID(),
        name: body.name.trim(),
        createdAt: new Date().toISOString(),
      };
      players.push(player);
      await writeBlob("players.json", players);
      return { jsonBody: player };
    } catch (e) {
      context.error("Failed to create player:", e.message);
      return { status: 500, jsonBody: { error: "Failed to create player" } };
    }
  },
});
