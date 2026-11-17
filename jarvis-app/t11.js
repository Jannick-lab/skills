const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const s = spawn('node', ['/home/user/skills/jarvis-app/server.js'], { env: { ...process.env, PORT: '3800', HOST: '127.0.0.1', STIMME: 'browser', JARVIS_TEST_ANTHROPIC_URL: 'http://127.0.0.1:4011/v1/messages', ANTHROPIC_API_KEY: 'k' } }); await sleep(800);
  const b = await chromium.launch();
  async function scenario(label, fakeSR, wait) {
    const ctx = await b.newContext(); await ctx.addInitScript(fakeSR);
    const p = await ctx.newPage(); await p.goto('http://localhost:3800'); await sleep(600);
    await p.click('#mic'); await sleep(400); const during = await p.textContent('#stateLabel');
    await sleep(wait);
    console.log(`[${label}] während: ${during} | danach: ${await p.textContent('#stateLabel')} | Meldung: ${JSON.stringify((await p.textContent('#reply')).slice(0, 70))} | Mic-aktiv=${await p.getAttribute('#mic', 'aria-pressed')}`);
    await ctx.close();
  }
  // a) startet, endet ohne Ergebnis und ohne Fehler (stiller Fehler)
  await scenario('startet, endet still', () => { const F = function () { const r = this; r.start = () => { r.onstart && r.onstart(); setTimeout(() => r.onend && r.onend(), 800); }; r.stop = r.abort = () => {}; }; window.SpeechRecognition = window.webkitSpeechRecognition = F; }, 1200);
  // b) startet und hängt für immer
  await scenario('startet, hängt', () => { const F = function () { const r = this; r.start = () => { r.onstart && r.onstart(); }; r.stop = r.abort = () => {}; }; window.SpeechRecognition = window.webkitSpeechRecognition = F; }, 12500);
  // c) normaler Erfolg
  await scenario('erkennt Text', () => { const F = function () { const r = this; r.start = () => { r.onstart && r.onstart(); setTimeout(() => { r.onresult({ results: [Object.assign([{ transcript: 'Hallo' }], { isFinal: true })] }); r.onend && r.onend(); }, 400); }; r.stop = r.abort = () => {}; }; window.SpeechRecognition = window.webkitSpeechRecognition = F; }, 1800);
  await b.close(); s.kill();
})();
