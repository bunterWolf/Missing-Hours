#!/usr/bin/env node
/*
 * Builds a copy of the site that can be published as a private Claude artifact: node _design/preview.mjs
 * The artifact wraps the page in its own <html>/<head>/<body>, so .preview/index.html keeps only the head tags that
 * matter (title, description, stylesheets, scripts) plus the body. Assets and the text pages are copied as they are.
 * Prints the `files` map for the Artifact publish.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '.preview');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const head = (html.match(/<head>([\s\S]*?)<\/head>/) || [])[1];
const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/) || [])[1];
if (head == null || body == null) { console.error('preview: index.html has no <head> or <body>'); process.exit(1); }

const keep = head.match(/<title>[\s\S]*?<\/title>|<meta name="description"[^>]*>|<link rel="stylesheet"[^>]*>|<script\b[^>]*><\/script>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), keep.join('\n') + '\n' + body.trim() + '\n');

const files = {};
function copy(rel) {
  const src = path.join(root, rel);
  if (fs.statSync(src).isDirectory()) { for (const f of fs.readdirSync(src)) copy(path.posix.join(rel, f)); return; }
  fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
  fs.copyFileSync(src, path.join(out, rel));
  files[rel] = path.posix.join('.preview', rel);
}
['assets', 'imprint', 'privacy'].forEach(copy);

console.log(JSON.stringify(files));
