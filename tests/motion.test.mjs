import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function page({ reduced = false, legacy = false, canvasAvailable = true } = {}) {
  const frames = new Map();
  const contexts = [];
  let nextId = 0, change, resize;
  const motion = { matches: reduced };
  if (legacy) motion.addListener = callback => { change = callback; };
  else motion.addEventListener = (event, callback) => {
    assert.equal(event, 'change');
    change = callback;
  };
  function canvas() {
    const context = {
      clears: 0, draws: 0,
      clearRect() { this.clears++; },
      drawImage() { this.draws++; },
      setTransform() {}, fillRect() {},
      createRadialGradient() { return { addColorStop() {} }; }
    };
    contexts.push(context);
    return { width: 300, height: 150, getContext: () => canvasAvailable ? context : null };
  }
  const canvases = { 'dust-back': canvas(), 'dust-front': canvas() };
  runInNewContext(script, {
    matchMedia: () => motion,
    document: {
      getElementById: id => canvases[id],
      querySelector: () => ({ getBoundingClientRect: () => ({ left: 424, top: 200, width: 432, height: 341 }) }),
      createElement: canvas
    },
    innerWidth: 1280, innerHeight: 800,
    window: { devicePixelRatio: 1 },
    performance: { now: () => 0 },
    requestAnimationFrame(callback) { const id = ++nextId; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    addEventListener: (event, callback) => { assert.equal(event, 'resize'); resize = callback; }
  });
  return {
    frames, contexts,
    setReduced(value) { motion.matches = value; change(); },
    resize() { resize(); },
    tick() {
      assert.equal(frames.size, 1);
      const [id, callback] = frames.entries().next().value;
      frames.delete(id);
      callback(16);
    }
  };
}

test('reduced motion at load stays still and can be re-enabled', () => {
  const p = page({ reduced: true });
  assert.equal(p.frames.size, 0);
  assert.ok(p.contexts.slice(0, 2).every(c => c.clears === 1 && c.draws === 0));
  p.resize();
  assert.equal(p.frames.size, 0);
  p.setReduced(false);
  p.tick();
  assert.equal(p.frames.size, 1);
});

test('live preference changes cancel and clear dust without duplicate animation loops', () => {
  const p = page();
  p.tick();
  assert.ok(p.contexts.slice(0, 2).some(c => c.draws > 0));
  const previousClears = p.contexts.slice(0, 2).map(c => c.clears);
  p.setReduced(true);
  assert.equal(p.frames.size, 0);
  p.contexts.slice(0, 2).forEach((c, i) => assert.equal(c.clears, previousClears[i] + 1));
  p.setReduced(false);
  p.setReduced(false);
  assert.equal(p.frames.size, 1);
  p.tick();
  p.setReduced(true);
  assert.equal(p.frames.size, 0);
});

test('older media-query listener API also responds to preference changes', () => {
  const p = page({ legacy: true });
  p.setReduced(true);
  assert.equal(p.frames.size, 0);
  p.setReduced(false);
  assert.equal(p.frames.size, 1);
});

test('unavailable canvas context leaves the static emblem usable', () => {
  const p = page({ canvasAvailable: false });
  assert.equal(p.frames.size, 0);
});
