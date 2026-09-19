// Real Chromium integration test, with no npm dependencies (Node 22+).
// CHROME_BIN=/path/to/chrome node tests/metric-density-browser.mjs
// App API calls use a localhost fixture (503 or explicit in-memory history): production is never contacted.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chromeBin = process.env.CHROME_BIN;
if (!chromeBin) throw new Error('Set CHROME_BIN to an installed Chromium/Chrome executable.');
const profile = await mkdtemp(resolve(tmpdir(), 'socialtest-browser-'));
const baseline = execFileSync('git', ['show', 'HEAD:index.html'], { cwd: root });
const apiRequests = [];
// Explicit local API fixture for offline/retry tests, never production data.
let historyOnline = false;
const fixtureHistory = new Map();
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path.startsWith('/api/')) {
    apiRequests.push({ method: req.method, path });
    if (historyOnline && path === '/api/history') {
      const quiz = new URL(req.url, 'http://localhost').searchParams.get('quiz');
      const records = fixtureHistory.get(quiz) || [];
      if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const record = JSON.parse(Buffer.concat(chunks).toString());
        if (!records.some(r => r.attemptId === record.attemptId)) records.push(record);
        fixtureHistory.set(quiz, records);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ok:true,attemptId:record.attemptId,count:records.length}));
      } else {
        res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(records));
      }
      return;
    }
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end('{"error":"Offline browser-test fixture; no cloud access"}');
    return;
  }
  if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
  if (path === '/baseline.html') { res.setHeader('Content-Type', 'text/html'); res.end(baseline); return; }
  const file = resolve(root, '.' + (path === '/' ? '/index.html' : decodeURIComponent(path)));
  if (!file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.png': 'image/png', '.json': 'application/json' })[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const chrome = spawn(chromeBin, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-sync', '--disable-extensions',
  '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  `--user-data-dir=${profile}`, 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const assertions = [];
try {
  const wsURL = await new Promise((resolveURL, reject) => {
    let stderr = '';
    const timer = setTimeout(() => reject(new Error('Chromium startup timeout: ' + stderr)), 20000);
    chrome.on('error', e => { clearTimeout(timer); reject(e); });
    chrome.on('exit', code => { clearTimeout(timer); reject(new Error('Chromium exited ' + code + ': ' + stderr)); });
    chrome.stderr.on('data', b => {
      stderr += b;
      const m = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolveURL(m[1]); }
    });
  });
  socket = new WebSocket(wsURL);
  await new Promise((r, j) => { socket.addEventListener('open', r, { once: true }); socket.addEventListener('error', j, { once: true }); });
  let seq = 0;
  const pending = new Map();
  const runtimeErrors = [];
  socket.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') runtimeErrors.push(msg.params.exceptionDetails);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: done, reject, timer } = pending.get(msg.id);
      pending.delete(msg.id); clearTimeout(timer);
      if (msg.error) reject(new Error(JSON.stringify(msg.error))); else done(msg.result);
    }
  });
  function cdp(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => cdp(method, params, sessionId);
  await send('Runtime.enable'); await send('Page.enable');
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async expression => {
    const end = Date.now() + 10000;
    while (Date.now() < end) {
      if (await evaluate(expression)) return;
      await new Promise(r => setTimeout(r, 40));
    }
    throw new Error('Condition timed out: ' + expression);
  };
  const check = async (name, expression) => {
    assert.equal(await evaluate(expression), true, name);
    assertions.push(name);
  };
  const goto = async path => {
    await send('Page.navigate', { url: origin + path });
    await waitFor(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`);
  };
  // Original browser suite runs unmodified.
  await goto('/tests.html');
  await waitFor('!!document.querySelector(".summary")');
  const legacy = await evaluate('({total:totalTests,passed:passCount,failed:failCount,failures:suites.flatMap(s=>s.tests.filter(t=>!t.pass))})');
  assert.equal(legacy.failed, 0, JSON.stringify(legacy.failures));
  console.log('Existing browser suite:', JSON.stringify(legacy));
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('socialtest_playerId','browser-test-player');
    localStorage.setItem('socialtest_playerName','Browser Test');
    if (!localStorage.getItem('socialtest_history')) localStorage.setItem('socialtest_history',JSON.stringify([{quizId:'science-matter',score:7,total:10}]));
  ` });
  await goto('/baseline.html');
  await waitFor('typeof QUIZ_REGISTRY !== "undefined" && document.getElementById("quiz-subject-header").textContent.length > 0');
  const oldQuizzes = await evaluate("JSON.stringify(QUIZ_REGISTRY.filter(q=>q.id!=='earth-science-metric-density'))");
  const oldHistory = await evaluate('localStorage.getItem("socialtest_history")');
  await goto('/index.html');
  await waitFor('typeof METRIC_DENSITY_QUIZ !== "undefined" && document.getElementById("quiz-subject-header").textContent.length > 0');
  assert.equal(await evaluate("JSON.stringify(QUIZ_REGISTRY.filter(q=>q.id!=='earth-science-metric-density'))"), oldQuizzes, 'Old quiz data changed');
  assertions.push('All old quiz definitions unchanged');
  await check('Grade 6 content counts and modes', `METRIC_DENSITY_QUIZ.grade===6 && METRIC_DENSITY_QUIZ.vocab.length===5 && METRIC_DENSITY_QUIZ.matching.items.length===15 && METRIC_DENSITY_QUIZ.mc.length===39 && JSON.stringify(METRIC_DENSITY_QUIZ.sections)===JSON.stringify(['vocab','matching','mc']) && METRIC_DENSITY_QUIZ.jeopardy.length===0`);
  await check('MC options valid and C28 absent', `METRIC_DENSITY_QUIZ.mc.every(q=>q.choices.length===4 && new Set(q.choices).size===4 && Number.isInteger(q.correct) && q.correct>=0 && q.correct<4) && !METRIC_DENSITY_QUIZ.mc.some(q=>q.id==='C28')`);
  await evaluate(`switchQuiz('earth-science-metric-density'); showScreen('mc')`);
  await check('No hint for unrelated definition question', `!document.getElementById('formula-hint-trigger') && !document.getElementById('formula-hint-modal').open`);
  await check('Unsupported hint metadata safely ignored', `getMCFormulaHint({}, {formulaHintId:'density'})===null && getMCFormulaHint(METRIC_DENSITY_QUIZ,{formulaHintId:'__proto__'})===null && getMCFormulaHint(METRIC_DENSITY_QUIZ,{formulaHintId:'missing'})===null`);
  const hints = await evaluate('METRIC_DENSITY_QUIZ.mc.filter(q=>q.formulaHintId).map(q=>({id:q.id,hint:q.formulaHintId}))');
  assert.equal(hints.length, 18);
  const expected = {
    'box-volume': ['Volume of a Box', 'V = l × w × h'],
    displacement: ['Volume by Water Displacement', 'Object volume = final reading − starting reading'],
    density: ['Density', 'D = m ÷ v'], volume: ['Volume from Mass and Density', 'v = m ÷ D'], mass: ['Mass', 'm = D × v']
  };
  for (const {id,hint} of hints) {
    await evaluate(`mcCurrentQ=mcData.findIndex(q=>q.id===${JSON.stringify(id)}); renderMC(); document.getElementById('formula-hint-trigger').click()`);
    const value = await evaluate(`({open:document.getElementById('formula-hint-modal').open,title:document.getElementById('formula-hint-title').textContent,formula:document.getElementById('formula-hint-equation').textContent,back:document.getElementById('formula-hint-back').textContent})`);
    assert.deepEqual(value, {open:true,title:expected[hint][0],formula:expected[hint][1],back:'Back to Quiz'});
    assertions.push('Correct modal formula for ' + id);
    await evaluate(`document.getElementById('formula-hint-back').click()`);
    await check('Back closes modal for ' + id, `!document.getElementById('formula-hint-modal').open`);
  }
  await evaluate(`mcCurrentQ=mcData.findIndex(q=>q.id==='N07'); renderMC(); document.querySelector('#mc-questions input[type=radio]').click()`);
  const before = await evaluate('JSON.stringify({mcCurrentQ,mcAnswers,mcResults,mcShuffleMap,progress:localStorage.getItem(getStorageKey())})');
  await evaluate(`document.getElementById('formula-hint-trigger').focus(); document.getElementById('formula-hint-trigger').click()`);
  await check('Modal traps focus in its Back button', `document.activeElement.id==='formula-hint-back'`);
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await check('Tab cannot focus underlying quiz', `!document.querySelector('#mc').contains(document.activeElement)`);
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await waitFor(`!document.getElementById('formula-hint-modal').open`);
  await check('Escape returns focus to hint button', `document.activeElement.id==='formula-hint-trigger'`);
  assert.equal(await evaluate('JSON.stringify({mcCurrentQ,mcAnswers,mcResults,mcShuffleMap,progress:localStorage.getItem(getStorageKey())})'), before);
  assertions.push('Answer, ordering, progress and score unchanged after hint');
  await evaluate(`document.getElementById('formula-hint-trigger').click(); document.getElementById('formula-hint-back').click()`);
  assert.equal(await evaluate('JSON.stringify({mcCurrentQ,mcAnswers,mcResults,mcShuffleMap,progress:localStorage.getItem(getStorageKey())})'), before);
  assertions.push('Back to Quiz also preserves complete quiz state');
  await evaluate(`mcSubmitOne(); document.getElementById('formula-hint-trigger').click(); document.getElementById('formula-hint-back').click()`);
  await check('Hint available after submission without advancing', `mcData[getActiveMCIndices()[mcCurrentQ]].id==='N07' && mcResults[mcCurrentQ]!==undefined`);
  await evaluate(`retryMC([mcData.findIndex(q=>q.id==='N11')]); document.getElementById('formula-hint-trigger').click()`);
  await check('Retry selects its own formula, not original question index', `document.getElementById('formula-hint-equation').textContent==='m = D × v'`);
  await evaluate(`showScreen('home')`);
  await check('Changing screen closes modal', `!document.getElementById('formula-hint-modal').open`);
  await evaluate(`switchQuiz('science-matter'); showScreen('mc'); openFormulaHint()`);
  await check('Old quiz has no hint button or stale modal', `!document.getElementById('formula-hint-trigger') && !document.getElementById('formula-hint-modal').open`);
  assert.equal(await evaluate('localStorage.getItem("socialtest_history")'), oldHistory);
  assertions.push('Existing history unchanged');
  // Mobile-sized real browser layout. This is Chromium, not a Safari claim.
  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate(`switchQuiz('earth-science-metric-density'); resetMC(); mcCurrentQ=mcData.findIndex(q=>q.id==='N07'); showScreen('mc'); document.getElementById('formula-hint-trigger').click()`);
  await check('Mobile modal centered, fits viewport, 44px close target', `(()=>{const d=document.getElementById('formula-hint-modal'),r=d.getBoundingClientRect(),b=document.getElementById('formula-hint-back').getBoundingClientRect();return Math.abs((r.left+r.width/2)-innerWidth/2)<2 && Math.abs((r.top+r.height/2)-innerHeight/2)<2 && r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight && b.height>=44 && d.scrollWidth<=d.clientWidth})()`);
  if (process.env.SCREENSHOT_PATH) {
    const shot = await send('Page.captureScreenshot', {format:'png'});
    await writeFile(process.env.SCREENSHOT_PATH, Buffer.from(shot.data,'base64'));
    console.log('Screenshot:', process.env.SCREENSHOT_PATH);
  }
  await evaluate(`closeFormulaHint(); mcCurrentQ=mcData.findIndex(q=>q.id==='N03'); renderMC(); openFormulaHint()`);
  await check('Long displacement formula fits mobile modal', `(()=>{const d=document.getElementById('formula-hint-modal');return d.scrollWidth<=d.clientWidth && d.getBoundingClientRect().bottom<=innerHeight})()`);
  await check('No hint contains question-specific numbers or answer choices', `Object.values(METRIC_DENSITY_QUIZ.formulaHints).every(h=>!/[0-9]/.test(h.formula))`);
  assert.equal(runtimeErrors.length,0,JSON.stringify(runtimeErrors));
  assertions.push('No uncaught browser JavaScript errors');
  assert.equal(apiRequests.filter(r=>r.method!=='GET').length,0,'Unexpected API write before persistence tests');
  assertions.push('Hint interactions did not write results');
  await evaluate(`closeFormulaHint(); resetMC(); showScreen('vocab'); vocabAnswers=Object.fromEntries(vocabData.map((q,i)=>[i,q.term])); submitVocab()`);
  await waitFor(`!historySyncInFlight && historyList(HISTORY_PENDING_KEY).length===1`);
  await check('503 keeps completed vocabulary result pending with warning', `document.getElementById('history-sync-status').textContent.includes('waiting to sync') && historyList(HISTORY_PENDING_KEY)[0].section==='vocab'`);
  const queuedId = await evaluate('historyList(HISTORY_PENDING_KEY)[0].attemptId');
  await goto('/index.html');
  await waitFor(`typeof historySyncInFlight!=='undefined' && !historySyncInFlight && document.getElementById('history-sync-status').textContent.includes('waiting to sync')`);
  assert.equal(await evaluate('historyList(HISTORY_PENDING_KEY)[0].attemptId'),queuedId);
  assertions.push('Pending result and stable attempt ID survive reload');
  historyOnline = true;
  await evaluate('flushPendingHistory()');
  await check('Successful ack empties queue and shows cloud confirmation', `historyList(HISTORY_PENDING_KEY).length===0 && document.getElementById('history-sync-status').textContent.includes('saved to cloud')`);
  assert.equal(fixtureHistory.get('earth-science-metric-density').length,1);
  assert.equal(fixtureHistory.get('earth-science-metric-density')[0].attemptId,queuedId);
  assertions.push('Recovered result read back from independent fixture storage');
  await evaluate('queueUnconfirmedHistory(); flushPendingHistory()');
  assert.equal(fixtureHistory.get('earth-science-metric-density').length,1);
  assertions.push('Confirmed local record is not uploaded again');
  await evaluate(`switchQuiz('earth-science-metric-density'); showScreen('matching'); matchingAnswers=Object.fromEntries(matchingData.items.map((q,i)=>[i,q.bucket])); submitMatching()`);
  await waitFor(`!historySyncInFlight && historyList(HISTORY_PENDING_KEY).length===0`);
  await evaluate(`showScreen('mc'); mcResults=Object.fromEntries(mcData.map((q,i)=>[i,true])); mcCurrentQ=mcData.length; renderMC()`);
  await waitFor(`!historySyncInFlight && historyList(HISTORY_PENDING_KEY).length===0`);
  const finalRecords=fixtureHistory.get('earth-science-metric-density');
  assert.deepEqual(finalRecords.map(r=>r.section).sort(),['matching','mc','vocab']);
  assertions.push('Vocabulary, matching and MC completions all reach server storage');
  await check('All completed results have durable confirmations', `historyList(HISTORY_SYNCED_KEY).length===3`);
  const settingsRequest = apiRequests.filter(r=>r.method!=='GET' && r.path!=='/api/history');
  assert.equal(settingsRequest.length,0);
  assertions.push('No question, settings, player or production API writes');
  console.log(JSON.stringify({integrationChecksPassed:assertions.length,checks:assertions,legacyTests:legacy.total},null,2));
} finally {
  socket?.close();
  if (chrome.exitCode === null && chrome.signalCode === null) {
    const exited = new Promise(r=>chrome.once('exit',r));
    chrome.kill('SIGTERM');
    await exited;
  }
  await new Promise(r=>server.close(r));
  await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
