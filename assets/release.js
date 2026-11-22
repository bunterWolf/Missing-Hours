/*
 * Keeps the download buttons on the newest stable release.
 * The HTML already links to a fixed installer (see _design/fixes.mjs), so the page works without this.
 * Here the browser asks GitHub for the latest release (betas are pre-releases and are skipped) and,
 * if it finds the Windows installer, points every [data-download] link at it and updates [data-version].
 */
(function () {
  'use strict';
  var REPO = 'bunterWolf/Missing-Hours';
  var links = document.querySelectorAll('a[data-download]');
  if (!links.length || !window.fetch) return;

  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rel) {
      if (!rel || rel.draft || rel.prerelease) return;
      var exe = (rel.assets || []).filter(function (a) {
        return /^Missing-Hours-Setup-[\d.]+-win-x64\.exe$/.test(a.name);
      })[0];
      var prefix = 'https://github.com/' + REPO + '/releases/download/';
      if (!exe || String(exe.browser_download_url).indexOf(prefix) !== 0) return;
      links.forEach(function (a) { a.href = exe.browser_download_url; });
      var version = String(rel.tag_name || '').replace(/^v/, '');
      if (/^\d+\.\d+\.\d+$/.test(version)) {
        document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = version; });
      }
    })
    .catch(function () { /* keep the links from the HTML */ });
})();
