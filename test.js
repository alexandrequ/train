#!/usr/bin/env node
// Pre-release checks for railstories.eu — no npm deps required
'use strict';
const { readFileSync, existsSync, readdirSync } = require('fs');
const { join, basename }                         = require('path');

const ROOT     = __dirname;
let   failures = 0;

function pass(msg)    { console.log(`  ✓ ${msg}`); }
function fail(msg)    { console.error(`  ✗ ${msg}`); failures++; }
function section(t)   { console.log(`\n${t}`); }

// ── helpers ──────────────────────────────────────────────────────────────────

function readJson(rel) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) { fail(`File missing: ${rel}`); return null; }
  try   { return JSON.parse(readFileSync(abs, 'utf8')); }
  catch (e) { fail(`Invalid JSON in ${rel}: ${e.message}`); return null; }
}

function readHtml(rel) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) { fail(`File missing: ${rel}`); return ''; }
  return readFileSync(abs, 'utf8');
}

// ── 1. Core asset existence ───────────────────────────────────────────────────
section('1. Core assets');
const CORE = [
  'index.html', 'en/index.html', 'script.js', 'styles.css',
  'bons-plans.json', 'stories/index.json',
  'logo-blue.png', 'Logo_hero.svg', 'favicon.ico', 'STTitanRegular.woff2',
];
for (const f of CORE)
  existsSync(join(ROOT, f)) ? pass(f) : fail(`Missing: ${f}`);

// ── 2. JSON validity ─────────────────────────────────────────────────────────
section('2. JSON validity');
const bonsPlans  = readJson('bons-plans.json');
if (bonsPlans)  pass('bons-plans.json');
const storyIndex = readJson('stories/index.json');
if (storyIndex) pass('stories/index.json');

// ── 3. Story cross-references ─────────────────────────────────────────────────
section('3. Story cross-references');
if (storyIndex) {
  for (const code of storyIndex) {
    const data = readJson(`stories/${code}.json`);
    if (data) pass(`stories/${code}.json — valid`);
  }
  const files  = readdirSync(join(ROOT, 'stories'))
    .filter(f => f.endsWith('.json') && f !== 'index.json');
  const listed = new Set(storyIndex);
  for (const f of files) {
    const code = basename(f, '.json');
    listed.has(code)
      ? pass(`stories/${f} — listed in index.json`)
      : fail(`stories/${f} — NOT listed in stories/index.json`);
  }
}

// ── 4. Required story fields ──────────────────────────────────────────────────
section('4. Required story fields');
if (storyIndex) {
  for (const code of storyIndex) {
    const d = readJson(`stories/${code}.json`);
    if (!d) continue;
    for (const field of ['name', 'route'])
      d[field] ? pass(`${code}: has "${field}"`) : fail(`${code}: missing "${field}"`);
    if (!d.narrative && !(d.highlights && d.highlights.length))
      fail(`${code}: no "narrative" or "highlights"`);
    else
      pass(`${code}: has content`);
  }
}

// ── 5. bons-plans integrity ───────────────────────────────────────────────────
section('5. bons-plans.json integrity');
if (bonsPlans) {
  for (const [code, tips] of Object.entries(bonsPlans)) {
    if (!/^\d+$/.test(code)) { fail(`Code "${code}" is not numeric`); continue; }
    if (!Array.isArray(tips)) { fail(`bons-plans["${code}"] is not an array`); continue; }
    let ok = true;
    for (const [i, tip] of tips.entries())
      for (const field of ['label', 'desc', 'url'])
        if (!tip[field]) { fail(`bons-plans["${code}"][${i}] missing "${field}"`); ok = false; }
    if (ok) pass(`bons-plans["${code}"] — ${tips.length} tip(s)`);
  }
}

// ── 6. HTML structure — French ────────────────────────────────────────────────
section('6. HTML structure — index.html (FR)');
const htmlFr = readHtml('index.html');
for (const [needle, label] of [
  ['id="accueil"',       '#accueil section'],
  ['id="carte"',         '#carte section'],
  ['id="bons-plans"',    '#bons-plans section'],
  ['id="je-monte"',      '#je-monte section'],
  ['id="contact"',       '#contact section'],
  ['id="storyModal"',    'story modal'],
  ['id="shareModal"',    'share modal'],
  ['src="script.js"',    'script.js reference'],
  ['href="styles.css"',  'styles.css reference'],
  ['lang="fr"',          'lang="fr"'],
])
  htmlFr.includes(needle) ? pass(label) : fail(`Missing ${label}`);

// ── 7. HTML structure — English ───────────────────────────────────────────────
section('7. HTML structure — en/index.html (EN)');
const htmlEn = readHtml('en/index.html');
for (const [needle, label] of [
  ['id="home"',              '#home section'],
  ['id="travel-map"',        '#travel-map section'],
  ['id="tips"',              '#tips section'],
  ['id="share"',             '#share section'],
  ['id="contact"',           '#contact section'],
  ['id="storyModal"',        'story modal'],
  ['id="shareModal"',        'share modal'],
  ['src="../script.js"',     '../script.js reference'],
  ['href="../styles.css"',   '../styles.css reference'],
  ['lang="en"',              'lang="en"'],
])
  htmlEn.includes(needle) ? pass(label) : fail(`Missing ${label}`);

// ── 8. No duplicate badge texts (FR) ─────────────────────────────────────────
section('8. Duplicate badge text check — index.html (FR)');
const badgeRe = /rs-badge[^>]+>([^<]+)</g;
const counts  = {};
let m;
while ((m = badgeRe.exec(htmlFr)) !== null) {
  const t = m[1].trim().replace(/\s+/g, ' ');
  if (!t) continue; // skip whitespace-only (icon-bearing badges)
  counts[t] = (counts[t] || 0) + 1;
}
let dup = false;
for (const [t, n] of Object.entries(counts))
  if (n > 1) { fail(`Badge "${t}" appears ${n}×`); dup = true; }
if (!dup) pass('No duplicate badge texts');

// ── Result ────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
if (failures === 0) { console.log('All checks passed.'); process.exit(0); }
else { console.error(`${failures} check(s) failed.`); process.exit(1); }
