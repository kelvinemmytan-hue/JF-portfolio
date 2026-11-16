// Captures project screenshots (assets/projects/<slug>.jpg) and the share image (assets/og-image.jpg)
// with a headless Chrome that uses its own temporary profile.
//   node scripts/screenshots.mjs              -> every project that has a URL and no screenshot yet
//   node scripts/screenshots.mjs slug1 slug2  -> only these projects (overwrites)
//   node scripts/screenshots.mjs --og         -> only the share image (from scripts/og-card.html)
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => fs.existsSync(p));
const PORT = +process.env.PORT || 9333;
const args = process.argv.slice(2);

const { projects } = JSON.parse(fs.readFileSync(path.join(root, "content/projects.json"), "utf8"));
const outDir = path.join(root, "assets/projects");
fs.mkdirSync(outDir, { recursive: true });

const jobs = [];
if (args[0] === "--url") {
  // Review mode: node scripts/screenshots.mjs --url <url> <out.jpg> <width> <height> [full]
  const [, url, out, w = "1440", h = "900", full] = args;
  jobs.push({ url, out: path.resolve(out), w: +w, h: +h, scale: 1, wait: +process.env.WAIT || 800, full: full === "full" });
} else if (args.includes("--og")) {
  // Fill the template from content/ so the share image always matches the profile and default theme.
  const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
  const th = JSON.parse(fs.readFileSync(path.join(root, "content/themes.json"), "utf8"));
  const c = th.themes[th.default].colors;
  const esc = (x = "") => String(x).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const values = { bg: c["--bg"], accent: c["--accent"], aurora1: c["--aurora-1"], aurora2: c["--aurora-2"], gradText: c["--grad-text"], initial: esc(site.initials[0]), name: esc(site.name), jobTitle: esc(site.jobTitle), tags: esc(site.ogTags || "") };
  const html = fs.readFileSync(path.join(root, "scripts/og-card.html"), "utf8").replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? "");
  const tmp = path.join(os.tmpdir(), `og-card-${process.pid}.html`);
  fs.writeFileSync(tmp, html);
  jobs.push({ url: pathToFileURL(tmp).href, out: path.join(root, "assets/og-image.jpg"), w: 1200, h: 630, scale: 1, wait: 500 });
} else {
  for (const p of projects) {
    if (!p.url) continue;
    const out = path.join(outDir, `${p.slug}.jpg`);
    if (args.length ? !args.includes(p.slug) : fs.existsSync(out)) continue;
    jobs.push({ url: p.url, out, w: 1440, h: 900, scale: 2 / 3, wait: +process.env.WAIT || 4000 });
  }
}
if (!jobs.length) { console.log("Nothing to capture."); process.exit(0); }

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "shots-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--window-size=1600,1200", "--hide-scrollbars", "--mute-audio", "--no-first-run", "about:blank"], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForChrome() {
  for (let i = 0; i < 50; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); }
  }
  throw new Error("Chrome did not start");
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { const { ok, ko } = pending.get(msg.id); pending.delete(msg.id); msg.error ? ko(new Error(msg.error.message)) : ok(msg.result); }
    else if (msg.method && listeners.has(msg.method)) listeners.get(msg.method)(msg.params);
  };
  return {
    open: new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }),
    send: (method, params = {}) => new Promise((ok, ko) => { const n = ++id; pending.set(n, { ok, ko }); ws.send(JSON.stringify({ id: n, method, params })); }),
    once: (method, ms) => new Promise((r) => { const t = setTimeout(r, ms); listeners.set(method, () => { clearTimeout(t); r(); }); }),
    close: () => ws.close(),
  };
}

try {
  await waitForChrome();
  for (const job of jobs) {
    const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
    const page = cdp(target.webSocketDebuggerUrl);
    try {
      await page.open;
      await page.send("Page.enable");
      await page.send("Emulation.setDeviceMetricsOverride", { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: job.w < 600 });
      // STATIC=1: emulate "reduce motion" so scroll animations do not hide content in review captures.
      if (process.env.STATIC) await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
      const loaded = page.once("Page.loadEventFired", 25000);
      await page.send("Page.navigate", { url: job.url });
      await loaded;
      await sleep(job.wait);
      if (job.full) {
        // Scroll through the page so scroll-reveal sections and lazy images appear.
        await page.send("Runtime.evaluate", { awaitPromise: true, expression: "(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}})()" });
        await sleep(1200);
      }
      await page.send("Runtime.evaluate", { expression: "window.scrollTo(0,0)" });
      const height = job.full ? (await page.send("Page.getLayoutMetrics")).cssContentSize.height : job.h;
      const y = +process.env.Y || 0; // review mode: start the capture lower on the page
      const { data } = await page.send("Page.captureScreenshot", { format: "jpeg", quality: 78, captureBeyondViewport: !!job.full || y > 0, clip: { x: 0, y, width: job.w, height: job.full && !process.env.Y ? height : job.h, scale: job.scale } });
      fs.writeFileSync(job.out, Buffer.from(data, "base64"));
      console.log("✓", path.relative(root, job.out));
    } catch (err) {
      console.log("✗", job.url, err.message);
    } finally {
      page.close();
      await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`).catch(() => {});
    }
  }
} finally {
  chrome.kill();
  await sleep(500);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }); } catch {} // Chrome may still hold a lock
}
