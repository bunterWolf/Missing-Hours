window.MHDesign = function (DCLogic) {
'use strict';
class Component extends DCLogic {
_cfg() { return {"runTop": 1062, "view": 520, "keys": ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13", "c14", "c15", "c16", "c17", "c18", "c19", "c20", "c21", "c22", "c23", "c24", "c25", "c26", "c27", "c28", "c29", "c30", "c31", "c32", "c33", "c34", "c35", "c36", "c37", "c38", "c39", "c40", "c41", "c42", "c43", "c44", "c45", "c46", "c47", "c48", "c49", "c50", "c51", "c52", "c53", "c54", "c55", "c56", "c57", "c58", "c59", "c60", "c61", "c62", "c63", "c64", "c65", "c66", "c67", "c68", "c69", "c70", "c71", "c72", "c73", "c74", "c75", "c76", "c77", "c78", "c79", "c80", "c81", "c82", "c83", "c84", "c85", "c86", "c87", "c88", "c89", "c90", "c91", "c92", "c93", "c94", "c95", "c96", "c97", "c98", "c99", "c100", "c101", "c102", "c103", "c104", "c105", "c106", "c107", "c108", "c109", "c110", "c111", "c112", "c113", "c114", "c115", "c116", "c117", "c118", "c119", "c120", "c121", "c122", "c123", "c124", "c125", "c126", "c127", "c128", "c129", "c130", "c131", "c132", "c133", "c134"], "flash": {"c52": "ev ev--green ev--xs", "c56": "ev ev--blue ev--xs", "c63": "ev ev--green ev--xs", "c105": "ev ev--blue ev--xs"}, "ztot": [["6h 0m", "1h 20m", "7h 20m"], ["5h 15m", "40m", "5h 55m"], ["7h 45m", "45m", "8h 30m"]], "zdates": ["Wed, 18 Nov", "Thu, 19 Nov", "Today"]}; }
_fmt(m) { const h = Math.floor(m / 60); const r = m % 60; return h ? h + 'h ' + r + 'm' : r + 'm'; }
_still() {
let still = true;
try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
return still || typeof this.setState !== 'function';
}
_type(i) {
if (i > 1 || this._still()) return;
this._typing = this._typing || {};
if (this._typing[i]) return;
this._typing[i] = true;
const key = 'ty' + i;
const step = () => {
const n = ((this.state || {})[key] || 0) + 1;
this.setState({ [key]: n });
if (n < 6) this._tt = setTimeout(step, 115);
};
this._tt0 = setTimeout(step, 500);
}
_root(e) {
try { return (e && e.currentTarget && e.currentTarget.getRootNode) ? e.currentTarget.getRootNode() : document; } catch (err) { return document; }
}
_byId(rn, id) {
try { return rn && rn.getElementById ? rn.getElementById(id) : document.getElementById(id); } catch (err) { return null; }
}
_measure(rn) {
// read only: which window titles are cut off right now -> state (rendered through holes)
try {
const root = rn || document;
const cut = {};
root.querySelectorAll('.ev[data-key]').forEach((c) => {
let on = false;
c.querySelectorAll('.ev-win, .ev-sub').forEach((t) => { if (t.clientWidth > 0 && t.scrollWidth > t.clientWidth + 1) on = true; });
if (on) cut[c.getAttribute('data-key')] = true;
});
const sig = Object.keys(cut).sort().join(',');
if (sig !== this._truncSig) { this._truncSig = sig; this.setState({ trunc: cut }); }
} catch (err) {}
}
_pickDay(d) {
this.setState({ day: d, zflash: false });
clearTimeout(this._tz);
const go = () => this._measure(document);
try { requestAnimationFrame(go); } catch (e) {}
}
_pickZoom(n) {
const flash = n !== 15;
this.setState({ zoom: n, zflash: flash });
clearTimeout(this._tz);
if (flash) this._tz = setTimeout(() => this.setState({ zflash: false }), 1600);
}
renderVals() {
const s = this.state || {};
const still = this._still();
const m = still ? 0 : (s.m || 0);

const cfg = this._cfg();
const r = Math.min(m, 120);
const runH = Math.max(26, r * 2);
const shift = Math.max(0, cfg.runTop + runH + 36 - cfg.view);
const hero = {
runStyle: 'top: ' + cfg.runTop + 'px; height: ' + runH + 'px;',
shiftStyle: 'transform: translateY(-' + shift + 'px);',
act: this._fmt(465 + r),
trk: this._fmt(510 + r),
dotCls: 'run-dot ' + (still ? '' : (m === 0 ? 'pulse-0' : (m % 2 ? 'pulse-1' : 'pulse-2')))
};

const full = '4h 25m';
const n1 = still ? 6 : (s.ty1 || 0);
const ty = {
ts: full.slice(0, n1),
caret2: !still
};

const zv = s.zoom || 15;
const dv = typeof s.day === 'number' ? s.day : 2;
const fl = !!s.zflash;
const zt = cfg.ztot[dv];
const zoom = {
date: cfg.zdates[dv],
act: zt[0], ina: zt[1], trk: zt[2],
prevCls: dv > 0 ? 'hd-b hd-btn' : 'hd-b hd-btn is-dis',
nextCls: dv < 2 ? 'hd-b hd-btn' : 'hd-b hd-btn is-dis',
prevDis: dv > 0 ? 'false' : 'true',
nextDis: dv < 2 ? 'false' : 'true',
prev: () => { if (dv > 0) this._pickDay(dv - 1); },
next: () => { if (dv < 2) this._pickDay(dv + 1); }
};
for (let d = 0; d < 3; d++) [15, 10, 5].forEach((n) => { zoom['d' + d + 'z' + n] = d === dv && n === zv; });
[15, 10, 5].forEach((n) => { const on = n === zv; zoom['s' + n] = { cls: on ? 'seg-o is-sel' : 'seg-o', on: on ? 'true' : 'false', pick: () => this._pickZoom(n) }; });
const zf = {};
Object.keys(cfg.flash).forEach((k) => { zf[k] = cfg.flash[k] + (fl ? ' is-flash' : ''); });

const rv = 30;
const keep = rv === 7 ? 2 : (rv === 30 ? 5 : 14);
const strip = {};
for (let k = 0; k < 14; k++) { const gone = k >= keep; strip['c' + k] = { cls: gone ? 'rcol is-gone' : 'rcol', st: '--d: ' + (Math.abs(k - keep) * 28) + 'ms;' }; }

const trunc = s.trunc || {};
const tr = {};
cfg.keys.forEach((k) => { const on = !!trunc[k]; tr[k] = { ti: on ? '0' : '-1', tr: on ? '1' : '0' }; });
return {
tr: tr,
hero: hero,
ty: ty,
zoom: zoom,
zf: zf,
strip: strip,
ui: { headCls: s.scrolled ? 'head is-scrolled' : 'head' }
};
}
componentDidMount() {
const markSoon = () => { clearTimeout(this._tm); this._tm = setTimeout(() => this._measure(document), 150); };
markSoon();
try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(markSoon); } catch (e) {}
try { this._onResize = markSoon; window.addEventListener('resize', this._onResize, { passive: true }); } catch (e) {}
const check = () => {
if (this._started || this._still()) return;
try {
const el = document.getElementById('example');
if (!el) { this._started = true; return; }
const r = el.getBoundingClientRect();
if (r.top < (window.innerHeight || 800) * 0.7 && r.bottom > 0) { this._started = true; this._type(1); }
} catch (e) { this._started = true; }
};
try {
this._onScroll = () => {
const sc = (window.scrollY || 0) > 4;
if (sc !== !!(this.state || {}).scrolled) this.setState({ scrolled: sc });
check();
};
window.addEventListener('scroll', this._onScroll, { passive: true });
} catch (e) {}
if (this._still()) return;
const now = new Date();
const wait = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
const inc = () => this.setState({ m: ((this.state || {}).m || 0) + 1 });
this._t1 = setTimeout(() => { inc(); this._iv = setInterval(inc, 60000); }, wait);
this._t3 = setTimeout(check, 300);
}
componentWillUnmount() {
try { window.removeEventListener('scroll', this._onScroll); window.removeEventListener('resize', this._onResize); } catch (e) {}
[this._tm, this._th, this._tz].forEach((t) => { if (t) clearTimeout(t); });
[this._t1, this._t2, this._t3, this._tt, this._tt0].forEach((t) => { if (t) clearTimeout(t); });
if (this._iv) clearInterval(this._iv);
}
}
return Component;
};
