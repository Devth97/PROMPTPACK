'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function stage(reduced = false) {
  const element = extra => ({events: {}, attrs: {}, style: {}, classList: {add() {}, toggle() {}},
    addEventListener(name, fn) { this.events[name] = fn; },
    setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; }, ...extra});
  const cards = [0, 1].map(() => {
    const video = element({muted: true, paused: true, play() { this.paused = false; return Promise.resolve(); }, pause() { this.paused = true; }});
    const button = element();
    return element({dataset: {}, video, button, querySelector: selector => selector === 'video' ? video : button});
  });
  const bars = cards.map(() => element({animate() { return this; }, play() { this.paused = false; }, pause() { this.paused = true; }, cancel() {}}));
  const tabs = bars.map(bar => element({querySelector: () => bar}));
  const stack = element();
  const root = element({querySelector: () => stack, querySelectorAll: selector => ({'[data-hs-card]': cards, '[data-hs-tab]': tabs, '[data-hs-copy]': cards.map(() => element())})[selector]});
  const document = element({hidden: false, querySelector: () => root});
  vm.runInNewContext(read('assets/hero-stage.js'), {document, matchMedia: query => ({matches: query.includes('reduced-motion') && reduced}), IntersectionObserver: class { observe() {} }});
  const click = button => button.events.click({preventDefault() {}, stopPropagation() {}});
  return {cards, tabs, bars, click};
}

test('hero sound toggles inline and holds rotation until muted', () => {
  const {cards, tabs, bars, click} = stage();
  const front = cards[0];
  assert.equal(front.video.muted, true);
  assert.equal(front.video.paused, false);
  assert.equal(front.button.attrs['aria-label'], 'Unmute video');
  assert.equal(cards[1].button.tabIndex, -1);
  click(front.button);
  assert.equal(front.video.muted, false);
  assert.equal(front.button.attrs['aria-label'], 'Mute video');
  assert.equal(front.button.attrs['aria-pressed'], 'true');
  assert.equal(bars[0].paused, true);
  click(front.button);
  assert.equal(front.video.muted, true);
  assert.equal(bars[0].paused, false);
  click(front.button);
  tabs[1].events.click();
  assert.equal(front.video.muted, true);
  assert.equal(front.video.paused, true);
  assert.equal(cards[1].video.muted, true);
  assert.equal(cards[1].video.paused, false);
});

test('reduced motion waits for an explicit sound click to play', () => {
  const {cards, click} = stage(true);
  assert.equal(cards[0].video.paused, true);
  click(cards[0].button);
  assert.equal(cards[0].video.paused, false);
  click(cards[0].button);
  assert.equal(cards[0].video.paused, true);
});

test('homepage and generator use corner sound controls without the old overlay', () => {
  for (const file of ['index.html', 'scripts/build-storefront.js']) {
    const source = read(file);
    assert.match(source, /class="hs-sound"/);
    assert.doesNotMatch(source, /hs-play|hs-dialog|Watch with sound/);
  }
});

test('phone hero video uses the full available width', () => {
  assert.match(read('assets/hero-stage.css'), /@media \(max-width:600px\)\{\.hs-stack\{width:100%\}/);
});
