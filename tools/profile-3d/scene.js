// Renders one profile image: ?view=hero|ledgerline|codeforge|intervexa|vericore|toolkit|button
// &layout=desktop|mobile. render.mjs calls window.frame(t) for t in [0, 1) and captures each frame;
// every animation here is periodic in t, so the encoded loop has no seam.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { PROFILE, LEDGER, PROJECTS, TOOLKIT, BUTTONS } from "./content.js";

const query = new URLSearchParams(location.search);
const VIEW = query.get("view") ?? "hero";
const LAYOUT = query.get("layout") ?? "desktop";
const MOBILE = LAYOUT === "mobile";
const PROJECT = PROJECTS[VIEW];
document.body.classList.add(`view-${PROJECT ? "project" : VIEW}`, `view-${VIEW}`, `layout-${LAYOUT}`);

const V = THREE.Vector3;
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => {
  const k = clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
const fract = (x) => x - Math.floor(x);
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const ORANGE = new THREE.Color("#ff6229");
const BG = new THREE.Color("#0a0a0b");
const C = { white: "#d2d2d6", silver: "#a9a9af", mid: "#6c6c73", graphite: "#2f2f34", dark: "#161619" };

const overlay = document.getElementById("overlay");
const tagsEl = document.getElementById("tags");
const list = (items, fn) => items.map(fn).join("");

/* ------------------------------------------------------------------ text */

if (VIEW === "hero") {
  overlay.innerHTML = `
    <div class="topbar"><span><b>Lingu17</b> / README</span><span>${PROFILE.place}</span></div>
    <section class="hero">
      <p class="eyebrow">${PROFILE.role}</p>
      <h1>${PROFILE.first}<br>${PROFILE.last}<span>.</span></h1>
      <p class="lede">${PROFILE.lede}</p>
      <dl class="facts">${list(PROFILE.facts, ([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
    </section>
    <aside class="legend">
      <p><b>991</b>automated tests · one cube each</p>
      <ul>
        ${list(LEDGER, (s) => `<li><i style="--c:${s.color}"></i>${s.project} <b>${s.count}</b></li>`)}
        <li class="pulse"><i></i>test run</li>
      </ul>
    </aside>`;
} else if (PROJECT) {
  const p = PROJECT;
  overlay.innerHTML = `
    <div class="topbar"><span><b>${p.no}</b> / 04</span></div>
    <section class="proj">
      <p class="eyebrow">${p.category}</p>
      <h2>${p.name}</h2>
      <p class="head">${p.headline[0]}<br><span>${p.headline[1]}</span></p>
      <ul class="metrics">${list(p.metrics, (m) => `<li><b>${m.value}</b><span>${m.label}</span></li>`)}</ul>
      <ul class="chips">${list(p.stack, (s) => `<li>${s}</li>`)}</ul>
    </section>
    <p class="caption">${p.caption}</p>`;
} else if (VIEW === "toolkit") {
  overlay.innerHTML = `
    <section class="kit">
      <p class="eyebrow">What I build with</p>
      <h2>Toolkit<span>.</span></h2>
      <div class="kit__grid">
        ${list(
          TOOLKIT,
          (g, i) => `<div class="kit__group"><h3><b>0${i + 1}</b>${g.name}</h3><ul class="chips">${list(g.items, (x) => `<li>${x}</li>`)}</ul></div>`,
        )}
      </div>
    </section>`;
} else if (VIEW === "button") {
  const b = BUTTONS[query.get("b") ?? "portfolio"];
  if (b.primary) document.body.classList.add("primary");
  overlay.innerHTML = `<div class="btn">${b.label}<i>${b.icon}</i></div>`;
}

/* ------------------------------------------------------------------ 3D */

let update = () => {};
let render = () => {};
const tags = [];

if (VIEW !== "button") {
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("gl");
  const W = stage.clientWidth;
  const H = stage.clientHeight;

  // The toolkit's small model sits on the card itself, so its canvas is transparent.
  const CLEAR = VIEW === "toolkit";
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: CLEAR, premultipliedAlpha: false });
  if (CLEAR) renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = CLEAR ? null : BG.clone();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;

  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 500);

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  // Only emissive orange crosses the threshold; lit white surfaces stay below it.
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.2, 1.0);
  bloom.enabled = VIEW !== "toolkit";
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* helpers */
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.36, metalness: 0.18, ...o });
  const glow = (i = 4) => new THREE.MeshStandardMaterial({ color: "#200d05", emissive: ORANGE, emissiveIntensity: i, roughness: 0.4, metalness: 0 });
  const box = (w, h, d, r = 0.12) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
  function add(geo, material, pos, parent = scene) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function lights({ key = [-14, 24, 16], span = 24, keyI = 2.4, rimI = 1.1 } = {}) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a0b, 0.45));
    const k = new THREE.DirectionalLight(0xffffff, keyI);
    k.position.set(...key);
    k.castShadow = true;
    k.shadow.mapSize.set(4096, 4096);
    Object.assign(k.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 200 });
    k.shadow.bias = -0.0003;
    k.shadow.normalBias = 0.03;
    k.shadow.radius = 5;
    const rim = new THREE.DirectionalLight(ORANGE, rimI);
    rim.position.set(16, 10, -20);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(18, 6, 14);
    scene.add(k, rim, fill);
  }

  function ground(y = 0, near = 30, far = 90) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat("#09090b", { roughness: 0.95, metalness: 0 }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = y;
    plane.receiveShadow = true;
    scene.add(plane);
    const grid = new THREE.GridHelper(400, 200, 0x26262a, 0x1a1a1d);
    grid.position.y = y + 0.003;
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    scene.add(grid);
    scene.fog = new THREE.Fog(BG, near, far);
  }

  function dust(n, box3, seed = 7) {
    const r = rng(seed);
    const base = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      base[i * 3] = box3[0] + r() * (box3[1] - box3[0]);
      base[i * 3 + 1] = box3[2] + r() * (box3[3] - box3[2]);
      base[i * 3 + 2] = box3[4] + r() * (box3[5] - box3[4]);
      phase[i] = r();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: ORANGE, size: MOBILE ? 0.2 : 0.14, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    scene.add(pts);
    return (t) => {
      const p = geo.attributes.position.array;
      // Dust is still; see aim().
      void p;
    };
  }

  function aim(pos, target, fov) {
    const sway = 0;
    camera.fov = fov;
    camera.updateProjectionMatrix();
    const T = new V(...target);
    const off = new V(...pos).sub(T);
    const up = new V(0, 1, 0);
    return (t) => {
      camera.position.copy(T).add(off.clone().applyAxisAngle(up, sway * Math.sin(TAU * t)));
      camera.lookAt(T);
      camera.updateMatrixWorld();
    };
  }

  function tag(html, pos, cls = "") {
    const el = document.createElement("div");
    el.className = `tag ${cls}`;
    el.innerHTML = html;
    tagsEl.append(el);
    const t = { el, pos: typeof pos === "function" ? pos : () => pos, html };
    tags.push(t);
    return t;
  }
  const pv = new V();
  window.__tagIssues = new Set();
  function placeTags(t) {
    const stageBox = stage.getBoundingClientRect();
    const textBox = document.querySelector(".proj, .hero")?.getBoundingClientRect();
    for (const g of tags) {
      const p = g.pos(t);
      pv.copy(p).project(camera);
      g.el.style.transform = `translate(${((pv.x + 1) / 2) * W}px, ${((1 - pv.y) / 2) * H}px)`;
      g.el.style.opacity = g.opacity ? g.opacity(t) : 1;
      if (g.text) {
        const s = g.text(t);
        if (s !== g.html) g.el.innerHTML = g.html = s;
      }
      if (g.cls) g.el.className = `tag ${g.cls(t)}`;
      // Report any label that leaves the canvas or runs into the text column.
      const b = g.el.getBoundingClientRect();
      if (Number(g.el.style.opacity) > 0.05) {
        const out = b.left < stageBox.left + 8 || b.right > stageBox.right - 8 || b.top < stageBox.top + 8 || b.bottom > stageBox.bottom - 8;
        const hit = textBox && !MOBILE && b.left < textBox.left + 640 && b.bottom > textBox.top && b.top < textBox.bottom;
        if (out || hit) window.__tagIssues.add(`${g.el.textContent.trim()}${out ? " (off canvas" : " (over text"} at t=${t.toFixed(2)}: ${Math.round(b.left - stageBox.left)},${Math.round(b.top - stageBox.top)} → ${Math.round(b.right - stageBox.left)},${Math.round(b.bottom - stageBox.top)} of ${Math.round(stageBox.width)}x${Math.round(stageBox.height)})`);
      }
    }
  }

  /* ---------------------------------------------------------------- hero: the test ledger */

  function hero() {
    const total = LEDGER.reduce((a, s) => a + s.count, 0);
    const COLS = MOBILE ? 31 : 44;
    const ROWS = Math.ceil(total / COLS);
    const P = 1.32;
    const geo = new RoundedBoxGeometry(1, 1, 1, 2, 0.14);
    const glowAttr = new THREE.InstancedBufferAttribute(new Float32Array(total), 1);
    geo.setAttribute("aGlow", glowAttr);
    const material = mat("#ffffff", { roughness: 0.3, metalness: 0.12 });
    const o = ORANGE;
    material.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vGlow;")
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(${o.r.toFixed(4)}, ${o.g.toFixed(4)}, ${o.b.toFixed(4)}) * vGlow;`,
        )
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\ndiffuseColor.rgb *= 1.0 - clamp(vGlow * 0.35, 0.0, 0.85);",
        );
    };
    const cubes = new THREE.InstancedMesh(geo, material, total);
    cubes.castShadow = cubes.receiveShadow = true;
    const cells = [];
    let i = 0;
    for (const s of LEDGER) {
      const c = new THREE.Color(s.color);
      for (let k = 0; k < s.count; k++, i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        cells.push({ x: (col - (COLS - 1) / 2) * P, z: ((ROWS - 1) / 2 - row) * P, u: (1 - row / (ROWS - 1)) * 0.86 + (col / (COLS - 1)) * 0.14, s: rng(i + 11)() });
        cubes.setColorAt(i, c);
      }
    }
    scene.add(cubes);
    ground(0, MOBILE ? 40 : 46, MOBILE ? 120 : 130);
    lights({ key: [-44, 20, 14], span: 46, keyI: 2.6 });
    const drift = dust(MOBILE ? 160 : 240, [-44, 44, 2, 18, -34, 26]);
    const dummy = new THREE.Object3D();
    const cam = MOBILE ? aim([-10, 17, 36], [3, 0, -8], 42, 0.06) : aim([-22, 12.5, 30], [10, 0, -8], 32, 0.06);
    return (t) => {
      cells.forEach((c, k) => {
        const ph = fract(t - c.u);
        const d = Math.min(ph, 1 - ph);
        const front = Math.exp(-((d / 0.03) ** 2));
        const trail = ph < 0.5 ? Math.exp(-ph / 0.09) : 0;
        glowAttr.array[k] = 4 * front + 0.7 * trail;
        dummy.position.set(c.x, 0.5 + 1.3 * front + 0.18 * trail, c.z);
        dummy.updateMatrix();
        cubes.setMatrixAt(k, dummy.matrix);
      });
      glowAttr.needsUpdate = true;
      cubes.instanceMatrix.needsUpdate = true;
      drift(t);
      cam(t);
    };
  }

  /* ---------------------------------------------------------------- Ledgerline */

  function ledgerline() {
    ground(0, 26, 70);
    lights({ key: [-12, 22, 14], span: 16 });
    add(box(21, 0.5, 8.5, 0.2), mat(C.dark, { roughness: 0.5 }), [0, 0.25, 0]);
    add(box(2.8, 6.4, 2.8, 0.32), mat(C.graphite), [-7, 3.7, 0]);
    add(box(2.8, 6.4, 2.8, 0.32), mat(C.white, { roughness: 0.28 }), [7, 3.7, 0]);
    for (const x of [-7, 7]) add(box(2.86, 0.2, 2.86, 0.06), glow(2.2), [x, 6.1, 0]);
    const curve = new THREE.CatmullRomCurve3([new V(-7, 7.1, 0), new V(-4, 9.6, 0.3), new V(0, 10.5, 0.5), new V(4, 9.6, 0.3), new V(7, 7.1, 0)]);
    add(new THREE.TubeGeometry(curve, 160, 0.045, 8), mat("#3b3b40", { emissive: "#55555c", emissiveIntensity: 0.25 }), [0, 0, 0]);
    const at = [0.3, 0.5, 0.7];
    const rings = at.map((u) => {
      const m = glow(0.15);
      m.color.set(C.graphite);
      const ring = add(new THREE.TorusGeometry(0.95, 0.08, 20, 72), m, [0, 0, 0]);
      const p = curve.getPointAt(u);
      ring.position.copy(p);
      ring.lookAt(p.clone().add(curve.getTangentAt(u)));
      return { ring, m, u, p };
    });
    const packet = add(box(0.75, 0.75, 0.75, 0.16), glow(4), [0, 0, 0]);
    const light = new THREE.PointLight(ORANGE, 40, 9, 2);
    packet.add(light);
    // The plan, as a stack of ledger slabs in front of Ledgerline's agent.
    for (let k = 0; k < 3; k++) add(box(3.4, 0.28, 2.2, 0.08), mat(k % 2 ? C.silver : C.graphite), [0.4, 0.64 + k * 0.32, 2.4]);
    const planMat = mat(C.white);
    add(box(3.4, 0.3, 2.2, 0.08), planMat, [0.4, 1.62, 2.4]);
    const dust1 = dust(90, [-16, 16, 1, 14, -10, 6], 3);

    const travel = (t) => smooth(0.08, 0.62, t);
    tag("Payer's agent", new V(-5.5, 4.6, 1.5));
    tag("Ledgerline agent", new V(5.5, 4.6, 1.5), "tag--left");
    // The label rides below the packet, on whichever side has room.
    const sig = tag("<b>Signed answer</b>", (t) => curve.getPointAt(clamp(travel(t), 0, 1)).clone().add(new V(travel(t) > 0.5 ? -0.6 : 0.6, -0.9, 0)), "tag--accent");
    sig.cls = (t) => (travel(t) > 0.5 ? "tag--left tag--accent" : "tag--accent");
    sig.opacity = (t) => smooth(0.06, 0.1, t) * (1 - smooth(0.56, 0.6, t));
    ["01 signer", "02 fresh", "03 records"].forEach((s, k) => {
      const g = tag(s, rings[k].p.clone().add(new V(0, 1.4, 0)), "");
      g.cls = (t) => (travel(t) > rings[k].u && t < 0.94 ? "tag tag--accent" : "tag");
    });
    const pt = tag("", new V(-1.5, 1.65, 2.4));
    pt.text = (t) => (t > 0.66 && t < 0.95 ? "Plan · <b>credit</b> — no wrong refund" : "Plan · <b>refund?</b>");
    pt.cls = (t) => (t > 0.66 && t < 0.95 ? "tag--left tag--accent" : "tag--left");

    const cam = aim([-2.5, 9.5, 31], [-1.6, 5.4, 0], 30, 0.1);
    return (t) => {
      const u = travel(t);
      packet.position.copy(curve.getPointAt(clamp(u, 0, 1)));
      packet.rotation.set(TAU * t, TAU * t * 2, 0);
      const s = smooth(0.03, 0.09, t) * (1 - smooth(0.6, 0.66, t));
      packet.scale.setScalar(Math.max(s, 0.0001));
      light.intensity = 40 * s;
      for (const r of rings) {
        const passed = smooth(r.u - 0.015, r.u + 0.015, u) * (1 - smooth(0.92, 0.97, t));
        const flash = Math.exp(-(((u - r.u) / 0.04) ** 2)) * s;
        r.m.emissiveIntensity = 0.1 + 1.6 * passed + 3 * flash;
      }
      const ok = smooth(0.64, 0.7, t) * (1 - smooth(0.93, 0.98, t));
      planMat.color.set(C.white).lerp(new THREE.Color("#2a1208"), ok);
      planMat.emissive.copy(ORANGE);
      planMat.emissiveIntensity = 2.6 * ok;
      dust1(t);
      cam(t);
    };
  }

  /* ---------------------------------------------------------------- Code Forge AI: the atlas */

  async function codeforge() {
    const atlas = await (await fetch("./data/codeforge-atlas.json")).json();
    ground(0, 26, 72);
    lights({ key: [-12, 24, 14], span: 16 });
    add(box(14, 0.5, 14, 0.22), mat(C.dark, { roughness: 0.5 }), [0, 0.25, 0]);
    const cells = [];
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) cells.push({ x: x * 2.4, z: z * 2.4, d: Math.hypot(x, z * 1.05), a: Math.atan2(z, x) });
    cells.sort((a, b) => a.d - b.d || a.a - b.a);
    const files = [...atlas.files].sort((a, b) => b.bytes - a.bytes);
    const key = new Set(["main", "scanner", "rag", "embedding"]);
    const top = {};
    files.forEach((f, i) => {
      const c = cells[i];
      const h = 0.8 + Math.sqrt(f.bytes) / 30;
      const test = f.module.startsWith("tests.");
      add(box(1.55, h, 1.55, 0.14), mat(key.has(f.module) ? C.white : test ? C.mid : C.graphite, { roughness: 0.3 }), [c.x, 0.5 + h / 2, c.z]);
      if (key.has(f.module)) add(box(1.6, 0.16, 1.6, 0.05), glow(2.2), [c.x, 0.5 + h + 0.08, c.z]);
      top[f.module] = new V(c.x, 0.5 + h + 0.1, c.z);
    });
    const arcs = atlas.edges
      .filter((e) => top[e.from] && top[e.to])
      .map((e, i) => {
        const a = top[e.from];
        const b = top[e.to];
        const mid = a.clone().add(b).multiplyScalar(0.5);
        mid.y = Math.max(a.y, b.y) + 1.2 + a.distanceTo(b) * 0.35;
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
          new THREE.LineBasicMaterial({ color: 0x6a6a72, transparent: true, opacity: 0.45 }),
        );
        scene.add(line);
        const pulse = add(new THREE.SphereGeometry(0.13, 16, 12), glow(4), [0, 0, 0]);
        pulse.castShadow = false;
        return { curve, pulse, ph: fract(i * 0.6180339) };
      });
    const dust1 = dust(80, [-14, 14, 1, 14, -12, 8], 5);
    for (const m of ["main", "scanner", "rag", "embedding"]) {
      const p = top[m].clone().add(new V(0, 0.5, 0));
      tag(`${m}.py`, p, [m === "rag" ? "tag--accent" : "", m === "scanner" || m === "embedding" ? "tag--left" : ""].join(" "));
    }
    const cam = aim([15, 14.5, 22], [-0.6, 3.8, 0], 32, 0.14);
    return (t) => {
      for (const a of arcs) {
        const u = fract(2 * t + a.ph);
        a.pulse.position.copy(a.curve.getPoint(u));
        a.pulse.scale.setScalar(Math.max(0.0001, Math.sin(Math.PI * u)));
      }
      dust1(t);
      cam(t);
    };
  }

  /* ---------------------------------------------------------------- Intervexa: two PRs, one merge */

  function intervexa() {
    ground(0, 26, 72);
    lights({ key: [-12, 22, 14], span: 16 });
    const Y = 1.25;
    const tube = (pts, color, r = 0.13) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new V(...p)));
      add(new THREE.TubeGeometry(curve, 160, r, 12), mat(color, { roughness: 0.3 }), [0, 0, 0]);
      return curve;
    };
    tube([[-10, Y, 0], [9.5, Y, 0]], C.mid, 0.11);
    for (const x of [-9, -7, -5, -3]) add(new THREE.SphereGeometry(0.3, 24, 16), mat(C.silver), [x, Y, 0]);
    const a = tube([[-7, Y, 0], [-4.5, Y + 0.6, -3.2], [0, Y + 1, -3.8], [4.5, Y + 0.6, -2.6], [7, Y, 0]], C.white);
    const b = tube([[-5, Y, 0], [-2.5, Y + 0.6, 3.2], [1.5, Y + 1, 3.8], [5, Y + 0.6, 2.6], [7, Y, 0]], C.silver);
    for (const [curve, u] of [[a, 0.42], [b, 0.4]]) {
      const ring = add(new THREE.TorusGeometry(0.42, 0.06, 16, 48), mat(C.white, { emissive: "#ffffff", emissiveIntensity: 0.6 }), [0, 0, 0]);
      const p = curve.getPointAt(u);
      ring.position.copy(p);
      ring.lookAt(p.clone().add(curve.getTangentAt(u)));
    }
    const mergeMat = glow(1);
    const merge = add(box(1.4, 1.4, 1.4, 0.2), mergeMat, [7, Y, 0]);
    const shock = add(new THREE.TorusGeometry(1, 0.05, 12, 96), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true }), [7, Y, 0]);
    shock.rotation.x = Math.PI / 2;
    const pulses = [a, b].map((curve) => ({ curve, m: add(new THREE.SphereGeometry(0.22, 20, 14), glow(4), [0, 0, 0]) }));

    // Intervexa's codebase map, faint, behind.
    const r = rng(21);
    const nodes = [];
    for (let i = 0; i < 48; i++) nodes.push(new V(-13 + r() * 26, 0.4 + r() * 2.2, -9 - r() * 6));
    const seg = [];
    nodes.forEach((n, i) => {
      nodes
        .map((m, j) => ({ j, d: n.distanceTo(m) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
        .forEach(({ j }) => seg.push(n, nodes[j]));
    });
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color: 0x4a4a52, transparent: true, opacity: 0.4 })));
    nodes.forEach((n, i) => add(new THREE.SphereGeometry(i % 14 === 0 ? 0.18 : 0.11, 12, 8), i % 14 === 0 ? glow(2.5) : mat(C.mid), [n.x, n.y, n.z]));
    const dust1 = dust(70, [-14, 14, 1, 12, -10, 6], 9);

    tag("main", new V(1.5, Y + 0.45, 0.3));
    tag("PR A · <b>tests pass</b>", a.getPointAt(0.42).clone().add(new V(0, 0.9, 0)));
    tag("PR B · <b>tests pass</b>", b.getPointAt(0.4).clone().add(new V(0.6, -0.9, 0)));
    const mt = tag("Combined · <b>KeyError: 'token'</b>", new V(6.2, Y + 1.7, 0), "tag--left tag--accent");
    mt.opacity = (t) => smooth(0.6, 0.66, t) * (1 - smooth(0.92, 0.97, t));
    tag("Codebase map · pinned commit", new V(-3, 3.2, -12));

    const go = (t) => smooth(0.1, 0.58, t);
    const cam = aim([-1, 12.5, 17.5], [0.4, 1.6, -1.2], 34, 0.1);
    return (t) => {
      const u = go(t);
      const vis = smooth(0.06, 0.12, t) * (1 - smooth(0.56, 0.6, t));
      for (const p of pulses) {
        p.m.position.copy(p.curve.getPointAt(u));
        p.m.scale.setScalar(Math.max(vis, 0.0001));
      }
      const hit = smooth(0.58, 0.62, t) * (1 - smooth(0.92, 0.98, t));
      mergeMat.emissiveIntensity = 0.5 + 2.6 * hit + 1.2 * hit * Math.sin(TAU * t * 6) ** 2;
      merge.rotation.y = 0.6 * Math.sin(TAU * t);
      const w = smooth(0.6, 0.85, t);
      shock.scale.setScalar(1 + 4 * w);
      shock.material.opacity = (t > 0.6 ? 1 - w : 0) * 0.9;
      dust1(t);
      cam(t);
    };
  }

  /* ---------------------------------------------------------------- Vericore: the relevance gate */

  function vericore() {
    ground(0, 26, 72);
    lights({ key: [-12, 22, 14], span: 16 });
    // A fanned stack of document pages, the top one with lines of text.
    const pages = new THREE.Group();
    pages.position.set(-5.6, 0, -0.4);
    scene.add(pages);
    for (let i = 0; i < 6; i++) {
      const pg = add(box(3.4, 0.09, 4.4, 0.04), mat(i % 2 ? C.silver : C.white, { roughness: 0.45 }), [0, 0.1 + i * 0.15, 0], pages);
      pg.rotation.y = -0.32 + i * 0.07;
    }
    const topPage = new THREE.Group();
    topPage.position.set(0, 0.95, 0);
    topPage.rotation.y = -0.32 + 5 * 0.07;
    pages.add(topPage);
    for (let l = 0; l < 10; l++) add(box(l % 4 === 3 ? 1.6 : 2.6, 0.02, 0.13, 0.01), mat(C.mid), [l % 4 === 3 ? -0.5 : 0, 0.01, -1.7 + l * 0.36], topPage);

    // The gate.
    const gx = 0;
    for (const z of [-2.3, 2.3]) add(box(0.34, 5, 0.34, 0.08), mat(C.graphite), [gx, 2.5, z]);
    add(box(0.34, 0.34, 4.94, 0.08), mat(C.graphite), [gx, 5.0, 0]);
    for (const z of [-2.08, 2.08]) add(box(0.06, 4.6, 0.06, 0.02), glow(1.8), [gx, 2.45, z]);
    add(box(0.06, 0.06, 4.2, 0.02), glow(1.8), [gx, 4.78, 0]);
    const veil = add(new THREE.PlaneGeometry(4.2, 4.6), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }), [gx, 2.45, 0]);
    veil.rotation.y = Math.PI / 2;
    veil.castShadow = false;

    // The answer: a page whose lines each carry a citation marker.
    const answer = new THREE.Group();
    answer.position.set(4.9, 0, -1.4);
    answer.rotation.y = -0.45;
    scene.add(answer);
    add(box(3.6, 4.6, 0.24, 0.1), mat(C.white, { roughness: 0.3 }), [0, 2.5, 0], answer);
    const marks = [];
    for (let l = 0; l < 6; l++) {
      add(box(l % 2 ? 2.0 : 2.5, 0.12, 0.02, 0.01), mat(C.mid), [-0.25 - (l % 2 ? 0.25 : 0), 4.1 - l * 0.55, 0.13], answer);
      if (l % 2 === 0) {
        const m = glow(0.3);
        marks.push(m);
        add(box(0.34, 0.34, 0.06, 0.04), m, [1.35, 4.1 - l * 0.55, 0.14], answer);
      }
    }
    const slot = (k) => new V(1.35, 4.1 - k * 1.1, 0.7).applyAxisAngle(new V(0, 1, 0), answer.rotation.y).add(answer.position);
    const chips = [
      { z: -1.2, pass: true, d: 0.0, s: 0 },
      { z: 0.5, pass: false, d: 0.1, s: 0 },
      { z: 1.3, pass: true, d: 0.18, s: 1 },
      { z: -0.2, pass: true, d: 0.28, s: 2 },
    ].map((c) => ({ ...c, m: glow(0), slot: slot(c.s), mesh: null }));
    for (const c of chips) {
      c.m.color.set(C.silver);
      c.mesh = add(box(1.1, 0.16, 0.7, 0.05), c.m, [0, 0, 0]);
    }
    const dust1 = dust(70, [-14, 14, 1, 12, -10, 6], 13);

    tag("PDF · page-aware passages", new V(-5.2, 2.9, -2.2));
    tag("Relevance gate", new V(0.2, 5.6, -2.3));
    tag("Answer · <b>each claim cites its page</b>", new V(3.2, 0.35, -0.6), "tag--left");
    const rej = tag("Below threshold → <b>no LLM call</b>", new V(-0.4, 0.4, 2.2), "tag--accent");
    rej.opacity = (t) => smooth(0.5, 0.56, t) * (1 - smooth(0.9, 0.96, t));

    const start = new V(-5.6, 1.3, -0.4);
    const cam = aim([9, 8.5, 16.5], [0.2, 2.4, -0.6], 34, 0.08);
    return (t) => {
      const fade = 1 - smooth(0.9, 0.97, t);
      chips.forEach((c) => {
        const k = smooth(0.06 + c.d, 0.42 + c.d * 0.9, t);
        const p = new V();
        const a = start.clone().add(new V(0, 0, c.z));
        if (c.pass) {
          // Rise off the page, cross the gate, settle beside the line it supports.
          const curve = new THREE.CatmullRomCurve3([a, a.clone().add(new V(1.4, 2.2, 0)), new V(gx, 2.8, c.z * 0.6), c.slot]);
          p.copy(curve.getPointAt(k));
          const lit = smooth(0.48, 0.6, k);
          c.m.emissiveIntensity = 3 * lit * fade;
          c.m.color.set(C.silver).lerp(new THREE.Color("#2a1208"), lit);
          marks[c.s].emissiveIntensity = 0.3 + 2.4 * smooth(0.92, 1, k) * fade;
        } else {
          const curve = new THREE.CatmullRomCurve3([a, a.clone().add(new V(1.4, 2.2, 0)), new V(gx - 0.9, 2.5, c.z)]);
          p.copy(curve.getPointAt(k));
          const drop = smooth(0.48, 0.6, t);
          p.y -= drop * 2.4;
          p.x -= drop * 0.3;
          c.m.emissiveIntensity = 0;
          c.m.color.set(C.mid);
        }
        c.mesh.position.copy(p);
        c.mesh.rotation.set(0, -0.45 * smooth(0.6, 1, k) * (c.pass ? 1 : 0), 0);
        c.mesh.scale.setScalar(Math.max(smooth(c.d, c.d + 0.06, t) * fade, 0.0001));
      });
      dust1(t);
      cam(t);
    };
  }

  /* ---------------------------------------------------------------- toolkit: a small block of cubes */

  function toolkit() {
    lights({ key: [-8, 14, 10], span: 8 });
    const r = rng(4);
    const g = new THREE.Group();
    scene.add(g);
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const pop = r() < 0.22 ? 0.35 : 0;
          const lit = x === 1 && y === 1 && z === 1;
          add(box(0.92, 0.92, 0.92, 0.14), lit ? glow(1.3) : mat(r() < 0.5 ? C.white : r() < 0.5 ? C.mid : C.graphite, { roughness: 0.3 }), [x * (1.04 + pop), y * 1.04, z * (1.04 + pop * 0.5)], g);
        }
    g.rotation.set(0.5, -0.7, 0);
    scene.fog = null;
    const cam = aim([0, 0.5, 13], [0, 0, 0], 28, 0);
    return (t) => {
      cam(t);
    };
  }

  /* ---------------------------------------------------------------- avatar: the same block, alone */

  function avatar() {
    const update = toolkit();
    scene.fog = null;
    const cam = aim([0, 0.4, 16], [0, 0, 0], 30);
    return (t) => {
      update(t);
      cam(t);
    };
  }

  const make = { hero, ledgerline, codeforge, intervexa, vericore, toolkit, avatar }[VIEW];
  window.__scene = (async () => {
    update = await make();
  })();
  render = (t) => {
    update(t);
    placeTags(t);
    composer.render();
  };
}

window.frame = async (t) => {
  await window.ready;
  render(t);
  return true;
};

window.ready = (async () => {
  await Promise.all([
    document.fonts.load("800 40px 'Plus Jakarta Sans'"),
    document.fonts.load("500 40px 'Plus Jakarta Sans'"),
    document.fonts.load("500 20px 'JetBrains Mono'"),
  ]);
  await document.fonts.ready;
  await window.__scene;
  render(0.3);
  return true;
})();
