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
  await blob.upload(body, Buffer.byteLength(body, "utf8"), {
    blobHTTPHeaders: { blobContentType: "application/json" },
    overwrite: true,
  });
}

/** Convert a readable stream to string. */
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

/**
 * Delete a JSON blob. Silently succeeds if blob doesn't exist.
 */
async function deleteBlob(name) {
  const container = getClient().getContainerClient(CONTAINER);
  const blob = container.getBlockBlobClient(name);
  try {
    await blob.deleteIfExists();
  } catch (e) {
    if (e.statusCode !== 404) throw e;
  }
}

/** Atomic read/modify/write using ETags; retry competing writers, never overwrite them. */
async function updateBlob(name, defaultValue, update) {
  const blob = getClient().getContainerClient(CONTAINER).getBlockBlobClient(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    let current = defaultValue;
    let etag = null;
    try {
      const response = await blob.download(0);
      current = JSON.parse(await streamToString(response.readableStreamBody));
      etag = response.etag;
    } catch (e) {
      if (e.statusCode !== 404) throw e;
    }
    const next = update(current);
    if (next.skipWrite) return next.result;
    const body = JSON.stringify(next.data);
    try {
      await blob.upload(body, Buffer.byteLength(body, "utf8"), {
        blobHTTPHeaders: { blobContentType: "application/json" },
        conditions: etag ? { ifMatch: etag } : { ifNoneMatch: "*" },
      });
      return next.result;
    } catch (e) {
      if (![409, 412].includes(e.statusCode) || attempt === 4) throw e;
    }
  }
}

module.exports = { readBlob, writeBlob, deleteBlob, updateBlob };
