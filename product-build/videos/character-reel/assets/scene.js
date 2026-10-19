// The Juno and Pixel scene: set, app screen, shot plan, performance and captions.
// Every frame is drawn from HyperFrames time (hf-seek) and timing.js alone, so renders are repeatable.
import * as THREE from 'three';
import { buildJuno, buildBlocBlock, setBlockEyes, PALETTE } from './cast.js';
import timing from '../timing.js';
import { pickMove, applyMoves } from './camera-moves.js';

const W = 1080, H = 1920, FPS = timing.fps;
const lines = timing.lines;
// Matches the root data-duration: the dialogue length rounded up to the next frame-safe 0.05 s.
const DURATION = Math.ceil((timing.duration + 0.05) * 20) / 20;

// ---------------------------------------------------------------- deterministic helpers
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const loud = (who, t) => {
  const arr = timing.loudness[who];
  const f = t * FPS, i = Math.floor(f), k = f - i;
  return lerp(arr[clamp(i, 0, arr.length - 1)] || 0, arr[clamp(i + 1, 0, arr.length - 1)] || 0, k);
};
const lineAt = (t) => lines.find((l, i) => t >= l.start - 0.05 && t < (lines[i + 1] ? lines[i + 1].start - 0.05 : DURATION));
// Blink: a short, regular close every few seconds, offset per character.
const blinkAt = (t, offset) => { const p = (t + offset) % 3.7; return p < 0.12 ? Math.sin((p / 0.12) * Math.PI) : 0; };

// ---------------------------------------------------------------- renderer + scene
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('stage'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1220);
scene.fog = new THREE.Fog(0x1a1220, 9, 22);
const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 60);

// Lights: warm desk lamp from the left, cool screen glow from behind, purple room fill
scene.add(new THREE.HemisphereLight(0x8a6ab8, 0x2a1a24, 0.9));
const lamp = new THREE.DirectionalLight(0xffb27a, 3.1);
lamp.position.set(-4, 5, 4);
lamp.castShadow = true;
lamp.shadow.mapSize.set(2048, 2048);
Object.assign(lamp.shadow.camera, { left: -4, right: 4, top: 4, bottom: -2, near: 1, far: 16 });
scene.add(lamp);
const screenGlow = new THREE.PointLight(0x9dcbff, 18, 9, 1.6);
screenGlow.position.set(0, 2.4, -1.4);
scene.add(screenGlow);
// Soft front fill so faces read in close-ups
const fill = new THREE.DirectionalLight(0xfff0e6, 1.1);
fill.position.set(0.5, 2.2, 6);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xf598f2, 1.4);
rim.position.set(3, 3, -3);
scene.add(rim);

// Desk
const desk = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ color: 0x3b2a2f, roughness: 0.85 }));
desk.rotation.x = -Math.PI / 2;
desk.receiveShadow = true;
scene.add(desk);

// Laptop: base + keycaps (the characters stand on the keys), lid with the app screen
const KB_TOP = 0.3;
const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 3.2), new THREE.MeshStandardMaterial({ color: 0x2c2836, roughness: 0.45, metalness: 0.35 }));
base.position.set(0, 0.11, 0.2);
base.receiveShadow = true;
scene.add(base);
const keyGeo = new THREE.BoxGeometry(0.4, 0.08, 0.4);
const keyMat = new THREE.MeshStandardMaterial({ color: 0x17141e, roughness: 0.55 });
const keys = new THREE.InstancedMesh(keyGeo, keyMat, 12 * 5);
const m4 = new THREE.Matrix4();
let k = 0;
for (let r = 0; r < 5; r++) for (let c = 0; c < 12; c++) {
  m4.makeTranslation(-2.42 + c * 0.44 + (r % 2) * 0.1, 0.26, -0.72 + r * 0.44);
  keys.setMatrixAt(k++, m4);
}
keys.receiveShadow = true;
keys.castShadow = true;
scene.add(keys);
// A few accent keycaps in the palette
for (const [c, r, col] of [[1, 3, PALETTE.yellow], [10, 1, PALETTE.mint], [6, 4, PALETTE.pink]]) {
  const accent = new THREE.Mesh(keyGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
  accent.position.set(-2.42 + c * 0.44 + (r % 2) * 0.1, 0.265, -0.72 + r * 0.44);
  scene.add(accent);
}

const lid = new THREE.Group();
lid.position.set(0, 0.22, -1.38);
lid.rotation.x = -0.12;
const lidShell = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.5, 0.12), new THREE.MeshStandardMaterial({ color: 0x2c2836, roughness: 0.45, metalness: 0.35 }));
lidShell.position.y = 1.75;
lid.add(lidShell);
const appCanvas = document.createElement('canvas');
appCanvas.width = 1600; appCanvas.height = 1000;
const appTex = new THREE.CanvasTexture(appCanvas);
appTex.colorSpace = THREE.SRGBColorSpace;
appTex.anisotropy = 4;
const appScreen = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 3.31), new THREE.MeshBasicMaterial({ map: appTex, toneMapped: false }));
appScreen.position.set(0, 1.77, 0.065);
lid.add(appScreen);
scene.add(lid);

// Night city through a window far behind
const city = new THREE.Group();
const rnd = seeded(42);
for (let i = 0; i < 140; i++) {
  const lightMat = new THREE.MeshBasicMaterial({ color: rnd() < 0.7 ? 0xffd27a : 0xf598f2, transparent: true, opacity: 0.35 + rnd() * 0.5, fog: false });
  const dot = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.18), lightMat);
  dot.position.set(-9 + rnd() * 18, 0.5 + rnd() * 6, -12 - rnd() * 4);
  city.add(dot);
}
// The skyline continues to the left, so the reverse angle on Juno sees it past the laptop's edge.
// Its own seed keeps the original 140 lights exactly where they were.
const rndSide = seeded(7);
for (let i = 0; i < 160; i++) {
  const lightMat = new THREE.MeshBasicMaterial({ color: rndSide() < 0.75 ? 0xffd27a : 0xf598f2, transparent: true, opacity: 0.35 + rndSide() * 0.55, fog: false });
  const dot = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.24), lightMat);
  dot.position.set(-34 + rndSide() * 25, 0.3 + rndSide() * 7.5, -8 - rndSide() * 10);
  dot.lookAt(1.6, 1.6, 1.6);
  city.add(dot);
}
scene.add(city);

// ---------------------------------------------------------------- cast
const juno = buildJuno();
juno.group.position.set(-0.62, KB_TOP, 0.35);
juno.group.scale.setScalar(0.92);
juno.group.rotation.y = 0.38;
scene.add(juno.group);

const pixel = buildBlocBlock({ color: PALETTE.pixel, legs: 4, antenna: true, sneakers: false });
pixel.group.position.set(0.62, KB_TOP, 0.42);
pixel.group.rotation.y = -0.4;
scene.add(pixel.group);

// ---------------------------------------------------------------- the app on the laptop screen
// Each episode lists its own panels in script.json: {id, title, rows, color, strike?}.
// A line with "screen": "<id>" types that panel out while it is spoken. Up to six fit (2 x 3).
const PANELS = timing.panels || [];
const screenOrder = PANELS.map((p) => p.id);
function drawApp(t) {
  const x = appCanvas.getContext('2d'), w = appCanvas.width, h = appCanvas.height;
  x.fillStyle = '#121019'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#1d1a27'; x.fillRect(0, 0, w, 88);
  x.font = '900 40px Montserrat'; x.fillStyle = '#fffbf2'; x.textBaseline = 'middle';
  x.fillText('PromptPack · Reel Studio', 44, 46);
  x.font = '700 30px Montserrat'; x.fillStyle = '#a8f0c6'; x.textAlign = 'right';
  x.fillText(`● rendering · frame ${String(Math.floor(t * FPS)).padStart(4, '0')}`, w - 44, 46);
  x.textAlign = 'left';
  const current = lineAt(t);
  // Which panels have been revealed so far, and which one is typing now
  const reached = new Set(lines.filter((l) => l.screen && l.start <= t).map((l) => l.screen));
  const active = current && current.screen && screenOrder.includes(current.screen) ? current.screen : null;
  const ending = t > lines[lines.length - 1].start;
  PANELS.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const px = 44 + col * 770, py = 124 + row * 292, pw = 740, ph = 268;
    const on = reached.has(p.id) || ending;
    const isActive = active === p.id;
    x.fillStyle = isActive ? '#24202f' : '#1a1724'; x.fillRect(px, py, pw, ph);
    x.lineWidth = isActive ? 8 : 4; x.strokeStyle = on ? p.color : '#2f2a3c'; x.strokeRect(px, py, pw, ph);
    x.font = '900 50px Montserrat'; x.fillStyle = on ? p.color : '#3a3448'; x.fillText(p.title, px + 32, py + 58);
    if (!on) return;
    // Type the rows out across the line that introduces the panel
    const intro = lines.find((l) => l.screen === p.id);
    const prog = isActive && !ending ? clamp((t - intro.start) / Math.max(0.6, intro.end - intro.start - 0.3), 0, 1) : 1;
    const text = p.rows.join('\n');
    const shown = text.slice(0, Math.floor(text.length * prog));
    x.font = '800 44px Montserrat'; x.fillStyle = '#fffbf2';
    shown.split('\n').forEach((rowText, r) => {
      const ty = py + 128 + r * 56;
      x.fillText(rowText, px + 32, ty);
      if (p.strike) { const tw = x.measureText(rowText).width; x.fillStyle = p.color; x.fillRect(px + 28, ty - 4, tw + 8, 7); x.fillStyle = '#fffbf2'; }
    });
    if (isActive && prog < 1 && Math.floor(t * 2.5) % 2 === 0) {
      const lastRow = shown.split('\n').length - 1;
      const lastW = x.measureText(shown.split('\n')[lastRow]).width;
      x.fillStyle = p.color; x.fillRect(px + 38 + lastW, py + 106 + lastRow * 56, 18, 44);
    }
  });
  appTex.needsUpdate = true;
}

// ---------------------------------------------------------------- shot plan
// One camera per line: screen beats get the two-shot, everything else a close-up on the speaker.
// The line that says "close-up" cuts to an extreme close-up on that exact word. The last line pulls back.
const JUNO_HEAD = new THREE.Vector3(-0.62, KB_TOP + 1.3, 0.35);
const PIXEL_FACE = new THREE.Vector3(0.62, KB_TOP + 0.55, 0.42);
const SHOTS = {
  junoCU: { pos: [-0.28, KB_TOP + 1.42, 2.95], look: JUNO_HEAD.toArray(), fov: 32 },
  // Pixel is turned toward Juno, so both Pixel shots sit on its face's own axis.
  pixelCU: { pos: [-1.08, KB_TOP + 0.8, 3.38], look: [0.62, KB_TOP + 0.55, 0.42], fov: 34 },
  pixelECU: { pos: [-0.8, KB_TOP + 0.66, 3.0], look: [0.45, KB_TOP + 0.62, 0.73], fov: 30 },
  // Reverse angle on Juno from the right, looking past the laptop's left edge to the night city
  junoCity: { pos: [1.6, KB_TOP + 1.3, 1.6], look: [-2.2, KB_TOP + 1.5, -0.6], fov: 34 },
  // High angle looking down on both characters standing on the keys
  overhead: { pos: [0.1, KB_TOP + 5.6, 4.3], look: [-0.05, KB_TOP + 0.45, 0.15], fov: 34 },
  two: { pos: [0.04, KB_TOP + 1.15, 6.3], look: [0.04, KB_TOP + 1.2, -0.6], fov: 42 },
  threeQ: { pos: [2.3, KB_TOP + 1.0, 3.7], look: [0, KB_TOP + 0.85, 0], fov: 40 },
  wide: { pos: [0, KB_TOP + 3.0, 12.5], look: [0, KB_TOP + 1.9, -1.2], fov: 40 },
};
const cuts = [];
lines.forEach((l, i) => {
  const at = Math.max(0, l.start - 0.12);
  // A line can name its shot ("shot": "threeQ"); screen beats get the two-shot; the last line pulls back
  let shot = l.screen && l.screen !== 'end' ? 'two' : l.speaker === 'juno' ? 'junoCU' : 'pixelCU';
  if (SHOTS[l.shot]) shot = l.shot;
  if (i === lines.length - 1) shot = 'pull';
  cuts.push({ at: i === 0 ? 0 : at, shot, move: pickMove(l, shot, i) });
  if (l.shot && l.shot.startsWith('close-up-on:')) {
    const word = l.shot.split(':')[1];
    const w = l.words.find((x) => x.text.toLowerCase().startsWith(word));
    if (w) cuts.push({ at: w.start - 0.04, shot: 'pixelECU', move: pickMove(null, 'pixelECU', i) });
  }
});
// Each move plays out over its whole cut
cuts.forEach((c, i) => { c.end = i + 1 < cuts.length ? cuts[i + 1].at : DURATION; });
const shotAt = (t) => { let c = cuts[0]; for (const x of cuts) if (t >= x.at) c = x; return c; };
const PULL_START = lines[lines.length - 1].start - 0.12;

function placeCamera(t) {
  const cut = shotAt(t);
  const since = t - cut.at;
  let pos, look, fov;
  if (cut.shot === 'pull') {
    const k = ease(clamp((t - PULL_START) / (DURATION - PULL_START - 0.3), 0, 1));
    const a = SHOTS.two, b = SHOTS.wide;
    pos = a.pos.map((v, i) => lerp(v, b.pos[i], k));
    look = a.look.map((v, i) => lerp(v, b.look[i], k));
    fov = lerp(a.fov, b.fov, k);
  } else {
    // The cut's named move (dolly, arc, crash zoom...) bends the base shot over the cut
    const k = ease(clamp(since / Math.max(0.5, cut.end - cut.at), 0, 1));
    const c = applyMoves(SHOTS[cut.shot], cut.move, k, since, t);
    pos = c.pos.toArray(); look = c.look.toArray(); fov = c.fov;
  }
  camera.position.set(pos[0] + Math.sin(t * 0.6) * 0.03, pos[1] + Math.sin(t * 0.45) * 0.02, pos[2]);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(look[0], look[1], look[2]);
}

// ---------------------------------------------------------------- performance
const PIXEL_EYES = { deadpan: 'square', proud: 'tall', explaining: 'square', smug: 'slit', warm: 'wide' };
function perform(t) {
  const cur = lineAt(t);
  const speaking = cur && t <= cur.end + 0.05 ? cur.speaker : null;
  // Juno
  const jl = loud('juno', t);
  juno.rig.mouth.scale.set(1.15 - jl * 0.2, 1 + jl * 3.4, 1);
  juno.rig.head.rotation.x = -0.04 + Math.sin(t * 9) * 0.03 * jl;
  const lookAtPixel = speaking === 'pixel' ? 1 : 0.35;
  juno.rig.head.rotation.y = lerp(0.05, 0.42, lookAtPixel) + Math.sin(t * 0.7) * 0.03;
  juno.rig.head.rotation.z = Math.sin(t * 0.5) * 0.025;
  const jEmotion = cur && cur.speaker === 'juno' ? cur.emotion : 'curious';
  const browLift = { skeptical: [0.03, -0.005], curious: [0.018, 0.018], teasing: [0.01, 0.026], realizing: [0.03, 0.03] }[jEmotion] || [0.01, 0.01];
  juno.rig.brows[0].position.y = 0.37 + browLift[0];
  juno.rig.brows[1].position.y = 0.37 + browLift[1];
  const jBlink = blinkAt(t, 0.9);
  // Juno's eyes widen when she is shocked and narrow when she doubts
  const jOpen = { shocked: 1.35, panicked: 1.3, worried: 1.12, skeptical: 0.82 }[jEmotion] || 1;
  juno.rig.eyes.forEach((e) => e.scale.set(jOpen, Math.max(0.1, jOpen * (1 - jBlink)), jOpen));
  juno.rig.arms.left.rotation.z = 0.18 + (speaking === 'juno' ? 0.25 + Math.sin(t * 3.2) * 0.12 * jl : 0);
  juno.rig.arms.left.rotation.x = speaking === 'juno' ? -0.45 : -0.1;
  juno.rig.body.rotation.y = Math.sin(t * 0.8) * 0.015;
  // Pixel
  const pl = loud('pixel', t);
  const pEmotion = cur && cur.speaker === 'pixel' ? cur.emotion : 'deadpan';
  const ecu = shotAt(t).shot === 'pixelECU';
  // A Pixel line can set its eye shape ("eyes": "slit"); the extreme close-up defaults to tall
  const pEyes = cur && cur.speaker === 'pixel' && cur.eyes ? cur.eyes : ecu ? 'tall' : PIXEL_EYES[pEmotion] || 'square';
  setBlockEyes(pixel.rig.eyes, pEyes, blinkAt(t, 2.1));
  const squash = 1 + pl * 0.07 * Math.sin(t * 17);
  pixel.rig.top.scale.set(1 + (1 - squash) * 0.5, squash, 1 + (1 - squash) * 0.5);
  pixel.rig.top.position.y = pixel.rig.legs[0].position.y + 0.11 + Math.abs(Math.sin(t * 2.4)) * 0.012 * (speaking === 'pixel' ? 2 : 0.6);
  pixel.rig.head.rotation.y = speaking === 'juno' ? -0.45 : -0.12 + Math.sin(t * 0.6) * 0.04;
  pixel.rig.head.rotation.z = Math.sin(t * 1.3) * 0.03 * (speaking === 'pixel' ? 1 : 0.4);
  pixel.rig.arms.left.rotation.z = speaking === 'pixel' ? 0.3 + Math.sin(t * 5) * 0.25 * pl : 0;
  pixel.rig.arms.right.rotation.z = speaking === 'pixel' ? -0.2 - Math.sin(t * 4.3 + 1) * 0.2 * pl : 0;
  if (pixel.rig.antennaTip) pixel.rig.antennaTip.position.x = 0.2 + Math.sin(t * 6) * 0.012 * (1 + pl * 2);
}

// ---------------------------------------------------------------- captions + end card
const lineEl = document.getElementById('line'), speakerEl = document.getElementById('speaker'), capEl = document.getElementById('captions'), endEl = document.getElementById('endcard');
// The end card's words come from the episode's script.json ("endcard": {kicker, title, brand})
if (timing.endcard) for (const k of ['kicker', 'title', 'brand']) if (timing.endcard[k]) endEl.querySelector('.' + k).textContent = timing.endcard[k];
let shownId = null;
function captions(t) {
  const cur = lineAt(t);
  const visible = cur && t <= cur.end + 0.35;
  capEl.style.opacity = visible ? '1' : '0';
  if (!cur) return;
  // Long lines are shown in chunks of up to 7 words (preferring sentence ends), so a caption
  // never grows past two lines and covers the characters
  if (!cur.chunks) {
    cur.chunks = [[]];
    cur.words.forEach((w, i) => {
      const last = cur.chunks[cur.chunks.length - 1];
      const prev = cur.words[i - 1];
      if (last.length >= 7 || (last.length >= 3 && prev && /[.!?]$/.test(prev.text))) cur.chunks.push([]);
      cur.chunks[cur.chunks.length - 1].push(i);
    });
  }
  let chunk = 0;
  cur.chunks.forEach((c, k) => { if (k > 0 && t >= cur.words[c[0]].start - 0.05) chunk = k; });
  const key = cur.id + ':' + chunk;
  if (shownId !== key) {
    shownId = key;
    speakerEl.textContent = cur.speaker === 'juno' ? 'JUNO' : 'PIXEL';
    speakerEl.dataset.who = cur.speaker;
    capEl.dataset.who = cur.speaker;
    capEl.classList.toggle('punch', !!cur.punch);
    lineEl.innerHTML = cur.chunks[chunk].map((i) => `<span class="w" data-i="${i}">${cur.words[i].text}</span>`).join(' ');
  }
  // Each word pops as it is spoken: small, a little bigger, then settles (a pure function of time)
  const pop = (age, peak) => (age < 0 ? 1 : age < 0.08 ? 0.82 + (age / 0.08) * (peak - 0.82) : age < 0.2 ? peak - ((age - 0.08) / 0.12) * (peak - 1) : 1);
  lineEl.querySelectorAll('.w').forEach((span) => {
    const w = cur.words[Number(span.dataset.i)];
    span.classList.toggle('on', t >= w.start - 0.02);
    span.classList.toggle('now', t >= w.start - 0.02 && t < w.end);
    span.style.transform = `scale(${pop(t - w.start, cur.punch ? 1.28 : 1.12).toFixed(3)})`;
  });
  // The punchline line gets a short decaying wobble when it starts
  const age = t - cur.start;
  lineEl.style.transform = cur.punch && age >= 0 && age < 0.6 ? `rotate(${(Math.sin(age * 28) * 3 * (1 - age / 0.6)).toFixed(2)}deg)` : 'none';
  const endIn = clamp((t - (lines[lines.length - 1].end + 0.1)) / 0.5, 0, 1);
  endEl.style.opacity = String(endIn);
  if (endIn > 0) capEl.style.opacity = String(1 - endIn);
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  t = clamp(t, 0, DURATION);
  perform(t);
  drawApp(t);
  placeCamera(t);
  captions(t);
  // Juno is hidden in Pixel's extreme close-up and vice versa only via framing; both stay in the scene.
  renderer.render(scene, camera);
}
window.addEventListener('hf-seek', (event) => renderAt(event.detail.time));
// Canvas text needs the font before the first frame is drawn.
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady['juno-pixel-scene'] = document.fonts.load('900 40px Montserrat').then(() => document.fonts.ready).then(() => renderAt(window.__hfThreeTime || 0));
renderAt(window.__hfThreeTime || 0);
    
