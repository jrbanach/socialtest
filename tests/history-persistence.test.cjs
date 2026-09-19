// In-memory Azure SDK fixture exercising the actual blob helper and Functions handlers.
// Run: node --test tests/history-persistence.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { Readable } = require('node:stream');

function harness() {
  const blobs = new Map();
  const handlers = {};
  let conflicts = 0;
  let writes = 0;
  let uploadCalls = 0;
  const error = statusCode => Object.assign(new Error('Storage fixture ' + statusCode), { statusCode });
  const service = { getContainerClient: name => {
    assert.equal(name, 'quiz-data');
    return { getBlockBlobClient: name => ({
      async download() {
        if (!blobs.has(name)) throw error(404);
        const b = blobs.get(name);
        return { etag: String(b.version), readableStreamBody: Readable.from([Buffer.from(b.body)]) };
      },
      async upload(body, bytes, options) {
        uploadCalls++;
        assert.equal(bytes, Buffer.byteLength(body, 'utf8'), 'Upload must use UTF-8 bytes');
        const old = blobs.get(name);
        const c = options.conditions || {};
        if (conflicts > 0) { conflicts--; throw error(412); }
        if (c.ifNoneMatch === '*' && old) throw error(412);
        if (c.ifMatch && (!old || c.ifMatch !== String(old.version))) throw error(412);
        blobs.set(name, { body, version: (old?.version || 0) + 1 });
        writes++;
      },
      async deleteIfExists() { blobs.delete(name); }
    }) };
  } };
  const helperSandbox = {
    module: { exports: {} }, Buffer, process: { env: { STORAGE_CONNECTION_STRING: 'LOCAL_FIXTURE_ONLY' } },
    require: name => {
      assert.equal(name, '@azure/storage-blob');
      return { BlobServiceClient: { fromConnectionString: () => service } };
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../api/src/blobHelper.js'), 'utf8'), helperSandbox);
  const helper = helperSandbox.module.exports;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../api/src/functions/history.js'), 'utf8'), {
    require: name => name === '@azure/functions' ? { app: { http: (name, config) => { handlers[name] = config.handler; } } } : helper
  });
  const record = (id, overrides = {}) => ({ attemptId:id,quizId:'earth-science-metric-density',playerId:'fixture-player',playerName:'Test ³ ÷',section:'mc',score:3,total:4,timestamp:'2026-09-19T12:00:00.000Z',...overrides });
  const request = (value, quiz = 'earth-science-metric-density') => ({ query: new URLSearchParams(quiz ? { quiz } : {}), json: async () => value });
  const context = { error() {} };
  const get = async quiz => (await handlers.getHistory(request(null, quiz),context)).jsonBody;
  return { helper, record, request, context, handlers, get, blobs, setConflicts: n=>{conflicts=n;}, writes:()=>writes, uploadCalls:()=>uploadCalls };
}

test('New completion persists and returns the attempt ID only after storage writes', async()=>{
  const h=harness(); const r=h.record('attempt-1');
  const response=await h.handlers.postHistory(h.request(r),h.context);
  assert.equal(response.jsonBody.ok,true); assert.equal(response.jsonBody.attemptId,'attempt-1');
  assert.equal(h.writes(),1); assert.equal((await h.get())[0].attemptId,'attempt-1');
});
test('Retry with the same attempt ID is acknowledged without duplication or rewrite', async()=>{
  const h=harness(); const r=h.record('same-attempt');
  await h.handlers.postHistory(h.request(r),h.context);
  const second=await h.handlers.postHistory(h.request(r),h.context);
  assert.equal(second.jsonBody.count,1); assert.equal((await h.get()).length,1); assert.equal(h.writes(),1);
});
test('Recovery of a pre-ID legacy record does not duplicate its cloud copy', async()=>{
  const h=harness(); const old=h.record(undefined); delete old.attemptId;
  await h.helper.writeBlob('history-earth-science-metric-density.json',[old]);
  const response=await h.handlers.postHistory(h.request({...old,attemptId:'recovered-id'}),h.context);
  assert.equal(response.jsonBody.attemptId,'recovered-id'); assert.equal((await h.get()).length,1); assert.equal(h.writes(),1);
});
test('Concurrent distinct results survive an ETag collision', async()=>{
  const h=harness();
  await Promise.all([
    h.handlers.postHistory(h.request(h.record('a')),h.context),
    h.handlers.postHistory(h.request(h.record('b',{timestamp:'2026-09-19T12:00:01.000Z'})),h.context)
  ]);
  const ids=Array.from(await h.get(),r=>r.attemptId).sort();
  assert.deepEqual(ids,['a','b']); assert.ok(h.uploadCalls()>=3);
});
test('Concurrent retries of one result produce exactly one record', async()=>{
  const h=harness(); const r=h.record('shared');
  const responses=await Promise.all([h.handlers.postHistory(h.request(r),h.context),h.handlers.postHistory(h.request(r),h.context)]);
  assert.ok(responses.every(r=>r.jsonBody.ok)); assert.equal((await h.get()).length,1);
});
test('Exhausted concurrency retries return failure, not a false save acknowledgement', async()=>{
  const h=harness(); h.setConflicts(5);
  const response=await h.handlers.postHistory(h.request(h.record('not-saved')),h.context);
  assert.equal(response.status,500); assert.equal((await h.get()).length,0); assert.equal(h.uploadCalls(),5);
});
test('Unicode question content is uploaded with the correct UTF-8 length', async()=>{
  const h=harness(); const q={question:'Density: g/cm³; D = m ÷ v; 🌡️'};
  await h.helper.writeBlob('questions-test.json',q);
  assert.equal((await h.helper.readBlob('questions-test.json')).question,q.question);
});
test('Invalid attempt ID does not write a blob', async()=>{
  const h=harness(); const response=await h.handlers.postHistory(h.request(h.record({bad:'id'})),h.context);
  assert.equal(response.status,400); assert.equal(h.writes(),0);
});
test('Old history fields remain intact after appending a new result', async()=>{
  const h=harness(); const old=h.record('old',{section:'vocab',score:2});
  await h.helper.writeBlob('history-earth-science-metric-density.json',[old]);
  await h.handlers.postHistory(h.request(h.record('new')),h.context);
  const history=await h.get(); assert.equal(JSON.stringify(history[0]),JSON.stringify(old)); assert.equal(history.length,2);
});
test('Quiz-scoped writes do not touch another quiz or legacy history', async()=>{
  const h=harness();
  await h.helper.writeBlob('history.json',[{legacy:true}]);
  await h.helper.writeBlob('history-science-matter.json',[{old:true}]);
  await h.handlers.postHistory(h.request(h.record('new')),h.context);
  assert.equal((await h.helper.readBlob('history.json'))[0].legacy,true);
  assert.equal((await h.get('science-matter'))[0].old,true);
});
