// Camera moves for the shot plan. A move bends a base shot {pos, look, fov} over the life of
// one cut. k is the eased progress through the cut (0 to 1); since is seconds since the cut.
// Moves combine with "+", for example "arcRight+handheld". Every move is a pure function of
// time, so a frame rendered on its own matches the same frame in sequence.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const UP = new THREE.Vector3(0, 1, 0);

// Unit vector pointing to the camera's right, flat on the floor.
function rightOf(c) {
  const fwd = c.look.clone().sub(c.pos);
  return fwd.cross(UP).setY(0).normalize();
}
// Move the camera closer to (s < 1) or further from (s > 1) what it looks at.
function distance(c, s) { c.pos.sub(c.look).multiplyScalar(s).add(c.look); }
// Slide camera and target together, so the lens keeps its direction.
function slide(c, offset) { c.pos.add(offset); c.look.add(offset); }
// Swing the camera around what it looks at by a yaw angle in radians.
function swing(c, angle) { c.pos.sub(c.look).applyAxisAngle(UP, angle).add(c.look); }
// Turn the lens in place (pan) by a yaw angle in radians.
function turn(c, angle) { c.look.sub(c.pos).applyAxisAngle(UP, angle).add(c.pos); }

export const MOVES = {
  // Locked-off: nothing moves. Deadpan lines land harder on a still frame.
  static: () => {},
  // Physical push toward / away from the subject.
  dollyIn: (c, k) => distance(c, 1 - 0.12 * k),
  dollyOut: (c, k) => distance(c, 0.88 + 0.12 * k),
  // A slow push for a dawning thought.
  pushSlow: (c, k) => distance(c, 1 - 0.2 * k),
  // Lens zooms: the frame tightens without the camera moving.
  zoomIn: (c, k) => { c.fov *= 1 - 0.12 * k; },
  zoomOut: (c, k) => { c.fov *= 0.88 + 0.12 * k; },
  // Snap the lens in over a fifth of a second: the comedy punch-in.
  crashZoomIn: (c, k, since) => { c.fov *= lerp(1.5, 1, outCubic(clamp(since / 0.2, 0, 1))); },
  // Lateral travel on a straight line; the slider variants travel less.
  truckLeft: (c, k) => slide(c, rightOf(c).multiplyScalar(-0.35 * k)),
  truckRight: (c, k) => slide(c, rightOf(c).multiplyScalar(0.35 * k)),
  sliderLeft: (c, k) => slide(c, rightOf(c).multiplyScalar(-0.16 * k)),
  sliderRight: (c, k) => slide(c, rightOf(c).multiplyScalar(0.16 * k)),
  // Whole camera rises or sinks, lens level.
  pedestalUp: (c, k) => slide(c, new THREE.Vector3(0, 0.22 * k, 0)),
  pedestalDown: (c, k) => slide(c, new THREE.Vector3(0, -0.22 * k, 0)),
  // Curved travel around the subject; the orbit goes further.
  arcLeft: (c, k) => swing(c, -0.15 * k),
  arcRight: (c, k) => swing(c, 0.15 * k),
  orbitLeft: (c, k) => swing(c, -0.6 * k),
  orbitRight: (c, k) => swing(c, 0.6 * k),
  // The lens rotates from a fixed point.
  tiltUp: (c, k) => { c.look.y += 0.3 * k; },
  tiltDown: (c, k) => { c.look.y -= 0.3 * k; },
  panLeft: (c, k) => turn(c, 0.12 * k),
  panRight: (c, k) => turn(c, -0.12 * k),
  // Whip in: the lens arrives from 40 degrees off and snaps onto the subject in 0.25 s.
  whipIn: (c, k, since) => turn(c, 0.7 * (1 - outCubic(clamp(since / 0.25, 0, 1)))),
  // Rise and back away at once, for endings.
  craneUp: (c, k) => { distance(c, 1 + 0.25 * k); c.pos.y += 0.6 * k; },
  // An operator's hands: layered small sways, stronger than the house drift.
  handheld: (c, k, since, t) => {
    c.pos.x += Math.sin(t * 2.3) * 0.018 + Math.sin(t * 5.1 + 1) * 0.008;
    c.pos.y += Math.sin(t * 1.9 + 2) * 0.014 + Math.sin(t * 6.7) * 0.006;
    c.look.x += Math.sin(t * 1.7 + 0.5) * 0.012;
  },
};

// Default move for a cut when the script does not name one: the line's emotion picks it.
const BY_EMOTION = {
  panicked: 'crashZoomIn+handheld', shocked: 'crashZoomIn+handheld', frustrated: 'dollyIn+handheld',
  worried: 'pushSlow+handheld', skeptical: 'crashZoomIn', teasing: 'whipIn', sarcastic: 'static',
  deadpan: 'static', smug: 'zoomIn', realizing: 'pushSlow', relieved: 'dollyOut', excited: 'dollyIn+handheld',
};
const SCREEN_MOVES = ['arcRight', 'sliderLeft', 'sliderRight', 'truckLeft'];

export function pickMove(line, shot, index) {
  if (line && line.camera) return line.camera;
  if (shot === 'pixelECU') return 'crashZoomIn';
  if (shot === 'two') return SCREEN_MOVES[index % SCREEN_MOVES.length];
  if (shot === 'threeQ') return index % 2 ? 'pedestalUp' : 'arcLeft';
  return (line && BY_EMOTION[line.emotion]) || 'dollyIn';
}

export function applyMoves(base, names, k, since, t) {
  const c = { pos: new THREE.Vector3(...base.pos), look: new THREE.Vector3(...base.look), fov: base.fov };
  for (const name of names.split('+')) {
    const move = MOVES[name.trim()];
    if (!move) throw new Error(`Unknown camera move "${name}". Known: ${Object.keys(MOVES).join(', ')}`);
    move(c, k, since, t);
  }
  return c;
}
