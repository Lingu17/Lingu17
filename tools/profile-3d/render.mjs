// Renders every image in assets/profile/ from scene.html in headless Chrome.
//
//   npm run render                 all images
//   npm run render -- hero         only jobs whose name contains "hero"
//   npm run render -- hero --still 0.3   one PNG preview per job into frames/, no encoding
//   npm run render -- --check            step through every loop and report labels that clip, no images
//
// Animated images are captured frame by frame (window.frame(t), t in [0, 1)) and encoded
// with ffmpeg as looping animated WebP. Needs Chrome or Edge, and ffmpeg on PATH.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { BUTTONS } from "./content.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(ROOT, "../../assets/profile");
const FRAMES = path.join(ROOT, "frames");
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find((p) => fs.existsSync(p));

const PROJECTS = ["ledgerline", "codeforge", "intervexa", "vericore"];
const JOBS = [
  { name: "hero-desktop", view: "hero", layout: "desktop", w: 1600, h: 800, fps: 15, seconds: 6 },
  { name: "hero-mobile", view: "hero", layout: "mobile", w: 1080, h: 1500, fps: 15, seconds: 6 },
  ...PROJECTS.flatMap((v) => [
    { name: `${v}-desktop`, view: v, layout: "desktop", w: 1600, h: 720, fps: 12, seconds: 6 },
    { name: `${v}-mobile`, view: v, layout: "mobile", w: 1080, h: 1640, fps: 12, seconds: 6 },
  ]),
  { name: "avatar", view: "avatar", layout: "desktop", w: 1000, h: 1000, still: 0.25 },
  { name: "toolkit-desktop", view: "toolkit", layout: "desktop", w: 1600, h: 1600, still: 0.25, element: true },
  { name: "toolkit-mobile", view: "toolkit", layout: "mobile", w: 1080, h: 3600, still: 0.25, element: true },
  ...Object.keys(BUTTONS).map((b) => ({ name: `button-${b}`, view: "button", b, layout: "desktop", w: 800, h: 200, still: 0, element: true })),
];

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const stillAt = args.includes("--still") ? Number(args[args.indexOf("--still") + 1]) : null;
const filter = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--still");
const jobs = JOBS.filter((j) => !filter || j.name.includes(filter));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = http
  .createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader("content-type", TYPES[path.extname(file)] ?? "application/octet-stream");
    fs.createReadStream(file).pipe(res);
  })
  .listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const BASE = `http://127.0.0.1:${server.address().port}/scene.html`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars", "--force-color-profile=srgb"],
});
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(FRAMES, { recursive: true });

try {
  for (const job of jobs) {
    const started = Date.now();
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error(`  [${job.name}] page error:`, e.message));
    page.on("console", (m) => m.type() === "error" && console.error(`  [${job.name}] console:`, m.text()));
    await page.setViewport({ width: job.w, height: job.h, deviceScaleFactor: 1 });
    const q = new URLSearchParams({ view: job.view, layout: job.layout, ...(job.b ? { b: job.b } : {}) });
    await page.goto(`${BASE}?${q}`, { waitUntil: "networkidle0" });
    await page.evaluate(() => window.ready);
    const card = await page.$("#card");
    const shot = (file) => (job.element ? card.screenshot({ path: file, omitBackground: true }) : page.screenshot({ path: file, omitBackground: true }));

    if (checkOnly) {
      for (let i = 0; i < 40; i++) await page.evaluate((t) => window.frame(t), i / 40);
      console.log(`checked ${job.name}`);
    } else if (stillAt !== null) {
      await page.evaluate((t) => window.frame(t), job.still ?? stillAt);
      await shot(path.join(FRAMES, `preview-${job.name}.png`));
      console.log(`preview ${job.name} (${Date.now() - started} ms)`);
    } else if (job.still !== undefined) {
      await page.evaluate((t) => window.frame(t), job.still);
      await shot(path.join(OUT, `${job.name}.png`));
      console.log(`${job.name}.png`);
    } else {
      const dir = path.join(FRAMES, job.name);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const n = job.fps * job.seconds;
      for (let i = 0; i < n; i++) {
        await page.evaluate((t) => window.frame(t), i / n);
        await shot(path.join(dir, `${String(i).padStart(4, "0")}.png`));
      }
      const out = path.join(OUT, `${job.name}.webp`);
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-framerate", String(job.fps),
        "-i", path.join(dir, "%04d.png"),
        "-c:v", "libwebp_anim", "-pix_fmt", "yuva420p",
        "-quality", "72", "-compression_level", "4", "-loop", "0",
        out,
      ]);
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(`${job.name}.webp  ${n} frames  ${kb} KB  (${Math.round((Date.now() - started) / 1000)} s)`);
    }
    const issues = await page.evaluate(() => [...(window.__tagIssues ?? [])]);
    if (issues.length) console.warn(`  [${job.name}] labels: ${issues.join("; ")}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
