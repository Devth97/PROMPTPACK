// The cast: Juno and Bloc, built from simple low-poly shapes so every frame can be drawn from code.
// Original PromptPack characters. Each builder returns { group, rig } where rig holds the parts the
// performance code moves (head, mouth, brows, arms, eyes screen).
import * as THREE from './vendor/three.module.js';

export const PALETTE = {
  cream: 0xfffbf2, ink: 0x0b0b0f, pink: 0xf598f2, yellow: 0xffe14d,
  mint: 0xa8f0c6, blue: 0x9dcbff, coral: 0xff9f8e, pixel: 0xff6a2a,
};

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0, flatShading: true, ...extra });
function part(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
function pivot(position, ...children) {
  const group = new THREE.Group();
  group.position.set(...position);
  children.forEach((child) => group.add(child));
  return group;
}

// ---------------------------------------------------------------- Juno
// A maker: big curly hair puff, round yellow glasses, mint hoodie, pink headphones round her neck.
export function buildJuno() {
  const skin = mat(0x8d5a3c), skinDark = mat(0x6e4329), hair = mat(0x24170f), hoodie = mat(PALETTE.mint),
    hoodieDark = mat(0x7fd6a6), denim = mat(0x34405e), cream = mat(PALETTE.cream), pink = mat(PALETTE.pink),
    yellow = mat(PALETTE.yellow, { roughness: 0.45 }), ink = mat(PALETTE.ink), lip = mat(0x3a1418);
  const g = new THREE.Group();

  // Legs and shoes
  for (const side of [-1, 1]) {
    g.add(part(new THREE.CylinderGeometry(0.078, 0.066, 0.56, 6), denim, [side * 0.1, 0.32, 0]));
    g.add(part(new THREE.BoxGeometry(0.15, 0.08, 0.25), cream, [side * 0.1, 0.045, 0.035]));
    g.add(part(new THREE.BoxGeometry(0.152, 0.022, 0.252), pink, [side * 0.1, 0.008, 0.035]));
  }
  // Hoodie torso with a front pocket, hood ring and drawstrings
  const body = new THREE.Group();
  body.add(part(new THREE.CylinderGeometry(0.21, 0.27, 0.56, 7), hoodie, [0, 0.84, 0]));
  body.add(part(new THREE.CylinderGeometry(0.275, 0.28, 0.07, 7), hoodieDark, [0, 0.58, 0]));
  body.add(part(new THREE.BoxGeometry(0.26, 0.13, 0.04), hoodieDark, [0, 0.72, 0.235], [-0.12, 0, 0]));
  body.add(part(new THREE.TorusGeometry(0.16, 0.065, 5, 9), hoodieDark, [0, 1.09, -0.07], [Math.PI / 2.4, 0, 0]));
  for (const side of [-1, 1]) {
    body.add(part(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), cream, [side * 0.05, 0.98, 0.215], [0.12, 0, 0]));
    body.add(part(new THREE.IcosahedronGeometry(0.018, 0), cream, [side * 0.05, 0.875, 0.228]));
  }
  // Headphones resting round the neck
  body.add(part(new THREE.TorusGeometry(0.135, 0.028, 5, 12), pink, [0, 1.12, 0.01], [Math.PI / 2, 0, 0]));
  for (const side of [-1, 1]) body.add(part(new THREE.CylinderGeometry(0.06, 0.06, 0.045, 10), pink, [side * 0.14, 1.12, 0.05], [0, 0, Math.PI / 2]));
  body.add(part(new THREE.CylinderGeometry(0.058, 0.064, 0.1, 6), skin, [0, 1.15, 0]));
  g.add(body);

  // Arms on shoulder pivots so the performance can lift and gesture
  const arms = {};
  for (const side of [-1, 1]) {
    const upper = part(new THREE.CylinderGeometry(0.062, 0.056, 0.3, 6), hoodie, [0, -0.15, 0]);
    const cuff = part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), hoodieDark, [0, -0.43, 0]);
    const fore = part(new THREE.CylinderGeometry(0.056, 0.05, 0.25, 6), hoodie, [0, -0.29, 0]);
    const hand = part(new THREE.IcosahedronGeometry(0.058, 0), skin, [0, -0.48, 0.01]);
    const shoulder = pivot([side * 0.285, 1.03, 0], upper, fore, cuff, hand);
    shoulder.rotation.z = side * 0.18;
    arms[side < 0 ? 'right' : 'left'] = shoulder;
    g.add(shoulder);
  }

  // Head on a neck pivot
  const head = new THREE.Group();
  head.position.set(0, 1.19, 0);
  head.add(part(new THREE.IcosahedronGeometry(0.26, 1), skin, [0, 0.25, 0], [0, 0, 0], [1, 1.08, 0.98]));
  head.add(part(new THREE.IcosahedronGeometry(0.034, 0), skinDark, [0, 0.205, 0.27], [0, 0, 0], [0.9, 0.8, 1.2]));
  for (const side of [-1, 1]) head.add(part(new THREE.CircleGeometry(0.035, 8), mat(0xc96a6a, { transparent: true, opacity: 0.55 }), [side * 0.15, 0.17, 0.248], [0, side * 0.35, 0]));
  for (const side of [-1, 1]) head.add(part(new THREE.IcosahedronGeometry(0.05, 0), skin, [side * 0.258, 0.24, -0.01]));
  // Hair: back cap, a big curly puff on top, curls framing the face
  head.add(part(new THREE.IcosahedronGeometry(0.278, 1), hair, [0, 0.3, -0.06], [0, 0, 0], [1.04, 1.02, 0.95]));
  head.add(part(new THREE.IcosahedronGeometry(0.235, 1), hair, [0, 0.62, -0.06]));
  for (const [x, y, z, r] of [[-0.2, 0.44, 0.12, 0.085], [0.2, 0.45, 0.11, 0.085], [-0.09, 0.5, 0.17, 0.07], [0.08, 0.51, 0.17, 0.07], [-0.24, 0.3, 0.02, 0.07], [0.24, 0.31, 0.02, 0.07], [0.0, 0.53, 0.14, 0.06]])
    head.add(part(new THREE.IcosahedronGeometry(r, 0), hair, [x, y, z]));
  // Round yellow glasses, eyes behind them
  const eyes = [];
  for (const side of [-1, 1]) {
    head.add(part(new THREE.TorusGeometry(0.075, 0.014, 4, 14), yellow, [side * 0.097, 0.27, 0.24]));
    const eye = part(new THREE.IcosahedronGeometry(0.026, 1), ink, [side * 0.097, 0.27, 0.232]);
    eyes.push(eye);
    head.add(eye);
  }
  head.add(part(new THREE.BoxGeometry(0.05, 0.014, 0.014), yellow, [0, 0.282, 0.25]));
  const brows = [-1, 1].map((side) => {
    const brow = part(new THREE.BoxGeometry(0.085, 0.02, 0.02), hair, [side * 0.097, 0.37, 0.24]);
    head.add(brow);
    return brow;
  });
  const mouth = part(new THREE.BoxGeometry(0.09, 0.022, 0.02), lip, [0, 0.125, 0.25]);
  head.add(mouth);
  g.add(head);

  return { group: g, rig: { head, mouth, brows, eyes, arms, body }, height: 1.75 };
}

// ---------------------------------------------------------------- Bloc
// A little retro-monitor robot: pink rounded screen-head with glowing mint pixel eyes, one spring leg,
// noodle arms and an antenna. Its face is a canvas, so expressions are drawn, not modelled.
export function buildBloc() {
  const pink = mat(PALETTE.pink, { roughness: 0.5 }), ink = mat(PALETTE.ink, { roughness: 0.6 }), blue = mat(PALETTE.blue),
    yellow = mat(PALETTE.yellow, { roughness: 0.4 }), mint = mat(PALETTE.mint);
  const g = new THREE.Group();

  g.add(part(new THREE.CylinderGeometry(0.15, 0.17, 0.07, 12), blue, [0, 0.035, 0]));
  const helix = new THREE.CatmullRomCurve3(Array.from({ length: 48 }, (_, i) => {
    const a = (i / 47) * Math.PI * 2 * 4;
    return new THREE.Vector3(Math.cos(a) * 0.07, 0.07 + (i / 47) * 0.27, Math.sin(a) * 0.07);
  }));
  const spring = part(new THREE.TubeGeometry(helix, 160, 0.017, 6), yellow);
  g.add(spring);

  const top = new THREE.Group(); // everything above the spring bobs together
  top.position.y = 0.36;
  top.add(part(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 12), ink, [0, 0.02, 0]));
  // Rounded-rectangle head
  const w = 0.64, h = 0.5, r = 0.11;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const shell = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 2, curveSegments: 5 });
  shell.translate(0, 0, -0.15);
  const head = new THREE.Group();
  head.position.y = 0.3;
  head.add(part(shell, pink));
  // Screen: bezel plus a canvas face that glows
  head.add(part(new THREE.PlaneGeometry(0.52, 0.38), ink, [0, 0, 0.192]));
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 188;
  const faceTexture = new THREE.CanvasTexture(canvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.335), new THREE.MeshBasicMaterial({ map: faceTexture, toneMapped: false }));
  screen.position.z = 0.194;
  head.add(screen);
  // Antenna and side dials
  head.add(part(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5), ink, [0.12, 0.33, 0], [0, 0, -0.25]));
  const antennaTip = part(new THREE.IcosahedronGeometry(0.035, 1), yellow, [0.14, 0.41, 0]);
  head.add(antennaTip);
  for (const side of [-1, 1]) head.add(part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), blue, [side * 0.36, 0.05, 0], [0, 0, Math.PI / 2]));
  top.add(head);

  // Noodle arms from the sides of the head
  const arms = {};
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.36, 0.22, 0);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(side * 0.09, -0.08, 0.03), new THREE.Vector3(side * 0.1, -0.22, 0.05)]);
    arm.add(part(new THREE.TubeGeometry(curve, 16, 0.016, 5), ink));
    arm.add(part(new THREE.IcosahedronGeometry(0.045, 0), mint, [side * 0.1, -0.24, 0.05]));
    arms[side < 0 ? 'right' : 'left'] = arm;
    top.add(arm);
  }
  g.add(top);

  const face = { canvas, texture: faceTexture };
  drawBlocFace(face, { expression: 'neutral', blink: 0, glow: 0.4 });
  return { group: g, rig: { top, head, arms, spring, antennaTip, face }, height: 1.15 };
}

// Bloc's face. expression: neutral | happy | focus | wide | smug | sly. blink 0..1, glow 0..1 (voice loudness).
export function drawBlocFace(face, { expression = 'neutral', blink = 0, glow = 0 }) {
  const c = face.canvas, x = c.getContext('2d');
  x.fillStyle = '#12121a';
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = 'rgba(168,240,198,0.06)';
  for (let y = 0; y < c.height; y += 6) x.fillRect(0, y, c.width, 2);
  const eye = '#a8f0c6';
  x.shadowColor = eye;
  x.shadowBlur = 12 + glow * 22;
  x.fillStyle = eye;
  x.strokeStyle = eye;
  x.lineCap = 'round';
  x.lineWidth = 14;
  const cy = 88, dx = 58;
  for (const side of [-1, 1]) {
    const ex = c.width / 2 + side * dx;
    const open = 1 - blink;
    if (open < 0.15 || expression === 'focus') {
      x.beginPath(); x.moveTo(ex - 20, cy); x.lineTo(ex + 20, cy); x.stroke();
    } else if (expression === 'happy') {
      x.beginPath(); x.arc(ex, cy + 12, 20, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
    } else if (expression === 'smug') {
      x.beginPath(); x.ellipse(ex, cy + 4, 20, 9 * open + 3, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#12121a'; x.fillRect(ex - 24, cy - 22, 48, 20); x.fillStyle = eye;
    } else if (expression === 'sly') {
      x.beginPath(); x.ellipse(ex, cy, 18, 18 * open, side * 0.35, 0, Math.PI * 2); x.fill();
    } else {
      const r = expression === 'wide' ? 26 : 19;
      x.beginPath(); x.ellipse(ex, cy, r, r * open, 0, 0, Math.PI * 2); x.fill();
    }
  }
  x.shadowBlur = 0;
  face.texture.needsUpdate = true;
}

// ---------------------------------------------------------------- Bloc (block-creature style)
// A chunky rounded block with stubby legs, nub arms and black rectangle eyes that change shape.
// options: color, legs (2 | 4), antenna (bool), sneakers (bool)
export function buildBlocBlock({ color = PALETTE.pink, legs = 2, antenna = true, sneakers = true } = {}) {
  const body = mat(color, { roughness: 0.62 }), ink = mat(PALETTE.ink, { roughness: 0.5 }), yellow = mat(PALETTE.yellow, { roughness: 0.4 }),
    cream = mat(PALETTE.cream), mint = mat(PALETTE.mint);
  const g = new THREE.Group();
  const legH = 0.22, size = 0.78;
  const legXs = legs === 4 ? [-0.27, -0.09, 0.09, 0.27] : [-0.17, 0.17];
  const legParts = [];
  for (const x of legXs) {
    const leg = part(new THREE.BoxGeometry(legs === 4 ? 0.12 : 0.17, legH, legs === 4 ? 0.14 : 0.17), body, [x, legH / 2 + (sneakers ? 0.05 : 0), 0.08]);
    legParts.push(leg);
    g.add(leg);
    if (sneakers) {
      g.add(part(new THREE.BoxGeometry(0.21, 0.07, 0.27), cream, [x, 0.035, 0.12]));
      g.add(part(new THREE.BoxGeometry(0.212, 0.02, 0.272), mint, [x, 0.008, 0.12]));
    }
  }
  const top = new THREE.Group();
  top.position.y = legH + (sneakers ? 0.05 : 0);
  // Rounded block body
  const r = 0.07, w = size;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, 0); shape.lineTo(w / 2 - r, 0); shape.quadraticCurveTo(w / 2, 0, w / 2, r);
  shape.lineTo(w / 2, w * 0.92 - r); shape.quadraticCurveTo(w / 2, w * 0.92, w / 2 - r, w * 0.92);
  shape.lineTo(-w / 2 + r, w * 0.92); shape.quadraticCurveTo(-w / 2, w * 0.92, -w / 2, w * 0.92 - r);
  shape.lineTo(-w / 2, r); shape.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  const shell = new THREE.ExtrudeGeometry(shape, { depth: 0.62, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 2, curveSegments: 4 });
  shell.translate(0, 0, -0.31);
  const head = new THREE.Group();
  head.add(part(shell, body));
  // Rectangle eyes: scale.y = open/tall, scale.x = wide, rotation.z = angled
  const eyes = [-1, 1].map((side) => {
    const eye = part(new THREE.BoxGeometry(0.075, 0.12, 0.02), ink, [side * 0.16, 0.48, 0.345]);
    head.add(eye);
    return eye;
  });
  // Nub arms on the sides
  const arms = {};
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * (w / 2 + 0.03), 0.3, 0.05);
    arm.add(part(new THREE.BoxGeometry(0.11, 0.09, 0.12), body, [side * 0.05, 0, 0]));
    arms[side < 0 ? 'right' : 'left'] = arm;
    head.add(arm);
  }
  let antennaTip = null;
  if (antenna) {
    head.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.17, 5), ink, [0.18, w * 0.92 + 0.11, 0], [0, 0, -0.2]));
    antennaTip = part(new THREE.IcosahedronGeometry(0.045, 1), yellow, [0.2, w * 0.92 + 0.2, 0]);
    head.add(antennaTip);
  }
  top.add(head);
  g.add(top);
  return { group: g, rig: { top, head, eyes, arms, legs: legParts, antennaTip }, height: top.position.y + w * 0.92 + (antenna ? 0.25 : 0) };
}

// Eye shapes for the block-creature Bloc: square | tall | slit | wide | angry | sad | blink
export function setBlockEyes(eyes, shape = 'square', blink = 0) {
  const presets = {
    square: [1, 1, 0], tall: [0.9, 1.7, 0], slit: [1.5, 0.22, 0], wide: [1.35, 1.35, 0],
    angry: [1.3, 0.45, 0.45], sad: [1.3, 0.45, -0.4], blink: [1.4, 0.15, 0],
    bored: [1.45, 0.3, -0.22], fond: [1.25, 0.42, 0.3],
  };
  const [sx, sy, tilt] = presets[shape] || presets.square;
  eyes.forEach((eye, i) => {
    const side = i === 0 ? -1 : 1;
    eye.scale.set(sx, Math.max(0.12, sy * (1 - blink)), 1);
    eye.rotation.z = tilt * side;
  });
}
