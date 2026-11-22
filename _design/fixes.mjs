/*
 * Content changes applied to the design's markup on every build.
 * The design is the source of truth for look and copy; these are the deliberate differences:
 * real links, and claims corrected to what the app actually does.
 *
 * Every entry must match exactly `count` times. If a new design version changes the text,
 * the build stops and names the entry, so nothing is silently lost: update or remove that entry.
 */

export const REPO_URL = 'https://github.com/bunterWolf/Missing-Hours';

// Fallback download link in the HTML. assets/release.js replaces it in the browser with the newest
// stable release, so this only needs updating when the installer's name pattern changes.
export const FALLBACK_VERSION = '1.1.0';
export const FALLBACK_EXE = `${REPO_URL}/releases/download/v${FALLBACK_VERSION}/Missing-Hours-Setup-${FALLBACK_VERSION}-win-x64.exe`;

export const fixes = [
  {
    why: 'Logo: the design uploads it as a blob; the site serves the app icon itself.',
    find: '/_blob/9f1a4481f8dfb2052258b0c34ff2fc95',
    replace: 'assets/icon.svg',
    count: 2
  },
  {
    why: 'The repo has no license yet, so "open source" is not a claim we can make.',
    find: '<li>Free and open source. Read the code on GitHub [LICENSE]</li>',
    replace: `<li>Free. Read the code on <a href="${REPO_URL}" class="link-muted">GitHub</a>.</li>`,
    count: 1
  },
  {
    why: 'Placeholder GitHub links point at the real repository.',
    find: 'href="https://github.com/"',
    replace: `href="${REPO_URL}"`,
    count: 3
  },
  {
    why: 'Download buttons download the installer (release.js keeps them on the newest release).',
    find: '<a href="#download" class="pill">Download for Windows</a>',
    replace: `<a href="${FALLBACK_EXE}" class="pill" data-download>Download for Windows</a>`,
    count: 2
  },
  {
    why: 'No license yet (see above).',
    find: 'Free · Open source · Stays on your PC',
    replace: 'Free · No account · Stays on your PC',
    count: 1
  },
  {
    why: 'The GitHub installer is not code-signed. The version follows the latest release.',
    find: 'Free · Signed installer · Version 1.1.0',
    replace: `Free · Version <span data-version>${FALLBACK_VERSION}</span>`,
    count: 1
  },
  {
    why: 'No license yet: drop the placeholder.',
    find: '<span>[LICENSE]</span>\n',
    replace: '',
    count: 1
  },
  {
    why: 'Imprint and privacy are real pages.',
    find: 'href="#imprint"',
    replace: 'href="imprint/"',
    count: 1
  },
  {
    why: 'Imprint and privacy are real pages.',
    find: 'href="#privacy"',
    replace: 'href="privacy/"',
    count: 1
  },
  {
    why: 'The app deletes days after a fixed 30 days (ActivityStore.cleanupOldData); there is no setting.',
    find: 'Recordings delete themselves after 30 days, or after the period you choose.',
    replace: 'Recordings delete themselves after 30 days.',
    count: 1
  },
  {
    why: 'No retention setting in the app: the 7/30/90 picker becomes a plain statement.',
    find: '<div class="keep-ctl"><span class="keep-l" id="ret-l">Try it: keep the last</span><span class="seg" role="group" aria-labelledby="ret-l"><button type="button" class="{{ ret.s7.cls }}" aria-pressed="{{ ret.s7.on }}" onClick="{{ ret.s7.pick }}">7 days</button><button type="button" class="{{ ret.s30.cls }}" aria-pressed="{{ ret.s30.on }}" onClick="{{ ret.s30.pick }}">30 days</button><button type="button" class="{{ ret.s90.cls }}" aria-pressed="{{ ret.s90.on }}" onClick="{{ ret.s90.pick }}">90 days</button></span></div><p class="keep-note" aria-live="polite">{{ ret.note }}</p>',
    replace: '<div class="keep-ctl"><span class="keep-l">Keeps the last 30 days</span></div><p class="keep-note">Older days are deleted for good.</p>',
    count: 1
  }
];
