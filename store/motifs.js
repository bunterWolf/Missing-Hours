// The Microsoft Store images, in upload order (docs/MARKETING-STRATEGIE.md, section 8). key =
// screenshots.<key> in store/listing/<language>.json (headline, subline, caption). scrollTo = time of day
// at the top of the timeline (demo day: 8:45-17:15, lunch 12:30-13:15). pickerOpen shows the open zoom
// choice. 00-hero is the 16:9 Super hero art: no text and no product name (Partner Center rule); it
// reuses the captures of 01 (light) and 03 (dark).
const MOTIFS = [
  { file: '01-timeline', key: 'timeline', theme: 'light', interval: 15, view: 'day', scrollTo: '08:45' },
  { file: '02-breaks', key: 'breaks', theme: 'light', interval: 15, view: 'day', scrollTo: '10:45' },
  { file: '03-dark', key: 'dark', theme: 'dark', interval: 15, view: 'day', scrollTo: '13:15' },
  { file: '04-zoom', key: 'zoom', theme: 'light', interval: 5, view: 'day', scrollTo: '09:15', pickerOpen: true },
  { file: '05-privacy', key: 'privacy', theme: 'light', view: 'settings-store' },
];

const HERO = { file: '00-hero', theme: 'light', windows: ['03-dark', '01-timeline'] }; // back to front

module.exports = { MOTIFS, HERO };
