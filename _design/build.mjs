#!/usr/bin/env node
/*
 * Builds the landing page from the Claude Design export.
 *
 *   node _design/build.mjs [path/to/design.dc.html]     (default: _design/Site5.dc.html)
 *
 * Writes (generated, don't edit by hand):
 *   index.html          the design's markup, with template holes turned into data attributes
 *   assets/site.css     the design's stylesheet
 *   assets/design.js    the design's logic (class Component extends DCLogic), unchanged
 * Hand-written and untouched: assets/runtime.js, assets/release.js, assets/fonts.css, imprint/, privacy/.
 * Deliberate content changes live in _design/fixes.mjs.
 *
 * No dependencies, Node 18+.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixes } from './fixes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = resolve(process.argv[2] || join(here, 'Site5.dc.html'));
const srcName = relative(root, src).replace(/\\/g, '/');

const fail = (msg) => { console.error(`build: ${msg}`); process.exit(1); };
const between = (s, start, end, what) => {
  const a = s.indexOf(start);
  const b = s.indexOf(end, a + start.length);
  if (a < 0 || b < 0) fail(`could not find ${what} in ${srcName}`);
  return s.slice(a + start.length, b);
};

const source = readFileSync(src, 'utf8').replace(/\r\n/g, '\n');

// 1. Split the design file into its parts.
const helmet = between(source, '<helmet>', '</helmet>', '<helmet>');
const css = between(helmet, '<style>', '</style>', 'the <style> block');
let markup = between(source, '</helmet>', '</x-dc>', 'the page markup').trim();
const scriptTag = source.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/);
if (!scriptTag) fail('could not find the data-dc-script block');
const logic = scriptTag[1].trim();

// 2. Content fixes, each must match exactly as often as expected.
for (const f of fixes) {
  const n = markup.split(f.find).length - 1;
  if (n !== f.count) fail(`fix "${f.why}" expected ${f.count} match(es), found ${n}:\n  ${f.find.slice(0, 120)}`);
  markup = markup.split(f.find).join(f.replace);
}

// 3. Initial values: run the design's renderVals() once, as without motion (the no-JS state).
class DCLogic { constructor() { this.props = {}; this.state = {}; } setState() {} }
const Component = new Function('DCLogic', `${logic}\nreturn Component;`)(DCLogic);
const initial = new Component().renderVals();
const get = (o, p) => p.split('.').reduce((v, k) => (v == null ? undefined : v[k]), o);
const holeRe = /\{\{\s*([\w.$]+)\s*\}\}/g;
const fill = (tpl) => tpl.replace(holeRe, (_, p) => { const v = get(initial, p); return v == null ? '' : String(v); });
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => escText(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// 4. Turn template holes and <sc-if> into plain HTML with data attributes for assets/runtime.js.
const tokens = markup.split(/(<[^>]+>)/);
const blockTag = /^<(div|section|ol|ul|li|p|dl|table|header|footer|nav|h[1-6])[\s>]/;
const stack = [];
let holes = 0;

const out = tokens.map((tok, i) => {
  if (!tok.startsWith('<')) {
    return tok.replace(holeRe, (_, p) => {
      holes++;
      const v = get(initial, p);
      return `<span data-dc-text="${p}">${escText(v == null ? '' : String(v))}</span>`;
    });
  }
  if (tok.startsWith('<sc-if')) {
    const m = tok.match(/value="\{\{\s*([\w.$]+)\s*\}\}"/);
    if (!m) fail(`<sc-if> without a value hole: ${tok}`);
    // Pick div or span by what's inside, so the HTML stays valid.
    let depth = 0;
    let block = false;
    for (let j = i + 1; j < tokens.length; j++) {
      if (tokens[j].startsWith('<sc-if')) depth++;
      else if (tokens[j] === '</sc-if>') { if (depth === 0) break; depth--; }
      else if (blockTag.test(tokens[j])) block = true;
    }
    const tag = block ? 'div' : 'span';
    stack.push(tag);
    holes += (tok.match(holeRe) || []).length; // value and the editor-only hint
    return `<${tag} class="dc-if" data-dc-if="${m[1]}"${get(initial, m[1]) ? '' : ' hidden'}>`;
  }
  if (tok === '</sc-if>') {
    if (!stack.length) fail('unbalanced </sc-if>');
    return `</${stack.pop()}>`;
  }
  if (!tok.includes('{{')) return tok;

  const head = tok.match(/^<([a-zA-Z][\w-]*)/)[0];
  const tail = tok.endsWith('/>') ? '/>' : '>';
  const attrRe = /\s+([^\s=>\/]+)(?:="([^"]*)")?/g;
  const body = tok.slice(head.length, tok.length - tail.length);
  const plain = [];
  const bound = [];
  const on = {};
  for (const a of body.matchAll(attrRe)) {
    const [, name, value] = a;
    if (value === undefined || !value.includes('{{')) { plain.push(a[0]); continue; }
    holes += (value.match(holeRe) || []).length;
    if (name === 'hint-placeholder-val') continue; // editor-only hint
    const ev = name.match(/^on([A-Z]\w*)$/);
    if (ev) {
      const p = value.match(/^\{\{\s*([\w.$]+)\s*\}\}$/);
      if (!p) fail(`event handler must be a single hole: ${name}="${value}"`);
      on[ev[1].toLowerCase()] = p[1];
      continue;
    }
    bound.push([name, value]);
    plain.push(` ${name}="${escAttr(fill(value))}"`);
  }
  if (bound.length) plain.push(` data-dc='${escAttr(JSON.stringify(bound)).replace(/&quot;/g, '"')}'`);
  if (Object.keys(on).length) plain.push(` data-dc-on='${JSON.stringify(on)}'`);
  return head + plain.join('') + tail;
});
if (stack.length) fail('unbalanced <sc-if>');
markup = out.join('');

const expected = (source.slice(source.indexOf('</helmet>'), source.indexOf('</x-dc>')).match(holeRe) || []).length;
const removedByFixes = fixes.reduce((n, f) => n + ((f.find.match(holeRe) || []).length - (f.replace.match(holeRe) || []).length) * f.count, 0);
if (holes !== expected - removedByFixes) fail(`converted ${holes} template holes, expected ${expected - removedByFixes}`);
const leftover = markup.replace(/data-dc='[^']*'/g, '').match(/\{\{[^}]*\}\}|<\/?sc-|<\/?dc-|<helmet|\/_blob\//);
if (leftover) fail(`unconverted design syntax left in the markup: ${leftover[0]}`);

// 5. Write the files.
const banner = (c) => `${c[0]} Generated by _design/build.mjs from ${srcName}. Don't edit: change the design or _design/fixes.mjs. ${c[1]}`;

writeFileSync(join(root, 'assets/site.css'), `${banner(['/*', '*/'])}\n${css.trim()}\n\n/* runtime: <sc-if> wrappers don't take part in layout */\n.dc-if{display:contents}\n.dc-if[hidden]{display:none}\n`);

writeFileSync(join(root, 'assets/design.js'), `${banner(['/*', '*/'])}\nwindow.MHDesign = function (DCLogic) {\n'use strict';\n${logic}\nreturn Component;\n};\n`);

const title = 'Missing Hours – Find your missing hours';
const description = 'Missing Hours writes your workday down on its own, app by app, so you can fill in timesheets and invoices. Free for Windows. Everything stays on your PC.';
writeFileSync(join(root, 'index.html'), `<!doctype html>
<!-- ${banner(['', ''])} -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${escAttr(description)}">
<link rel="canonical" href="https://missing-hours.app/">
<link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/icon.png">
<meta name="theme-color" content="#f8f7f5" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141414" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Missing Hours">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${escAttr(description)}">
<meta property="og:url" content="https://missing-hours.app/">
<meta property="og:image" content="https://missing-hours.app/assets/icon.png">
<meta name="twitter:card" content="summary">
<link rel="preload" href="assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="assets/site.css">
<script src="assets/design.js" defer></script>
<script src="assets/runtime.js" defer></script>
<script src="assets/release.js" defer></script>
</head>
<body>
${markup}
</body>
</html>
`);

console.log(`build: index.html, assets/site.css, assets/design.js from ${srcName} (${holes} holes, ${fixes.length} fixes)`);
