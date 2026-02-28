const { BlobServiceClient } = require("@azure/storage-blob");

const CONTAINER = "quiz-data";
let _client = null;

/** Get or create the BlobServiceClient (cached). */
function getClient() {
  if (!_client) {
    const connStr = process.env.STORAGE_CONNECTION_STRING;
    if (!connStr) throw new Error("STORAGE_CONNECTION_STRING not configured");
    _client = BlobServiceClient.fromConnectionString(connStr);
  }
  return _client;
}

/**
 * Read a JSON blob. Returns parsed object or defaultValue if blob doesn't exist.
 * Always reads fresh from storage (no caching).
 */
async function readBlob(name, defaultValue = null) {
  const container = getClient().getContainerClient(CONTAINER);
  const blob = container.getBlockBlobClient(name);
  try {
    const resp = await blob.download(0);
    const text = await streamToString(resp.readableStreamBody);
    return JSON.parse(text);
  } catch (e) {
    if (e.statusCode === 404) return defaultValue;
    throw e;
  }
}

/**
 * Write a JSON blob (overwrites).
 */
async function writeBlob(name, data) {
  const container = getClient().getContainerClient(CONTAINER);
  const blob = container.getBlockBlobClient(name);
  const body = JSON.stringify(data);
  await blob.upload(body, body.length, {
    blobHTTPHeaders: { blobContentType: "application/json" },
    overwrite: true,
  });
}

/** Convert a readable stream to string. */
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

module.exports = { readBlob, writeBlob };
