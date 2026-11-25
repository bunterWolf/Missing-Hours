// Generates every app icon file from the master drawings in resources/icon-source/
// (160 x 160 viewBox, each file fills its canvas; the tile margins are part of the drawing).
// Run `npm run icons` after changing a master and commit the generated files.
//
//   resources/icon.ico     Windows: exe, installer, shortcuts, taskbar, window (16-256 px)
//   resources/icon.png     1024 px, window icon outside Windows, Linux
//   resources/icon.icns    macOS app bundle (16-1024 px), light tile on Apple's icon grid
//   resources/appx/*.png   Microsoft Store package assets (scale and targetsize variants, see APPX_*)
//   resources/store/AppTileIcon-300.png  Partner Center > Store listing > 1:1 App tile icon (300 px)
//
// Masters: windows-kachel.svg (white tile, Windows and Store), windows-unplated-hell/-dunkel.svg
// (no tile, black/white ticks for the light/dark taskbar), kachel-hell.svg (macOS tile).
// kachel-dunkel.svg and logo-hell/-dunkel.svg are not used here yet (macOS dark icon, website).

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const RESOURCES = path.join(ROOT, 'resources');
const master = (name) => fs.readFileSync(path.join(RESOURCES, 'icon-source', `${name}.svg`), 'utf8');
const WINDOWS = master('windows-kachel');
const UNPLATED_LIGHT_THEME = master('windows-unplated-hell'); // black ticks
const UNPLATED_DARK_THEME = master('windows-unplated-dunkel'); // white ticks
const MAC = master('kachel-hell');

const ICO_SIZES = [16, 20, 24, 32, 40, 48, 64, 128, 256];
// ICNS chunk type -> pixel size (the @2x types share pixel sizes with the 1x ones)
const ICNS_TYPES = [
  ['icp4', 16], ['ic11', 32], ['icp5', 32], ['ic12', 64], ['icp6', 64], ['ic07', 128],
  ['ic13', 256], ['ic08', 256], ['ic14', 512], ['ic09', 512], ['ic10', 1024],
];
// Store package: logo name -> size at scale 100; Windows picks the file for the display scale
const APPX_SCALED = [['StoreLogo', 50], ['Square44x44Logo', 44], ['Square150x150Logo', 150]];
const APPX_SCALES = [100, 125, 150, 200, 400];
// App icon (taskbar, Start, search) in exact pixel sizes, each with and without the tile
const APPX_TARGET_SIZES = [16, 20, 24, 30, 32, 36, 40, 48, 60, 64, 72, 80, 96, 256];

// Small icons get bolder ticks so they stay legible (design rule of the icon handoff)
function tickScale(size) {
  if (size <= 24) return 1.25;
  if (size <= 32) return 1.12;
  return 1;
}

// Renders a master centered on a transparent width x height canvas, the drawing `artSize` px wide.
function render(source, width, height = width, artSize = Math.min(width, height)) {
  const sourceSize = Number(source.match(/viewBox="0 0 ([\d.]+) [\d.]+"/)[1]);
  const units = sourceSize / artSize; // source units per output pixel
  const viewW = width * units;
  const viewH = height * units;
  const viewBox = `${(sourceSize - viewW) / 2} ${(sourceSize - viewH) / 2} ${viewW} ${viewH}`;
  const scale = tickScale(artSize);
  const svg = source
    .replace(/<svg[^>]*>/, (tag) => tag
      .replace(/\swidth="[^"]*"/, ` width="${width}"`)
      .replace(/\sheight="[^"]*"/, ` height="${height}"`)
      .replace(/\sviewBox="[^"]*"/, ` viewBox="${viewBox}"`))
    // only the ticks get bolder, not the tile's edge
    .replace(/<line\b[^>]*>/g, (line) => line
      .replace(/stroke-width="([\d.]+)"/, (_, w) => `stroke-width="${Number((w * scale).toFixed(3))}"`));
  const image = new Resvg(svg, { fitTo: { mode: 'original' }, shapeRendering: 2 }).render();
  return { png: image.asPng(), rgba: image.pixels, width: image.width, height: image.height };
}

// ICO entry as 32-bit BMP (sizes below 256; the most compatible form, e.g. for NSIS)
function bmpEntry({ rgba, width, height }) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(width, 4);
  header.writeInt32LE(height * 2, 8); // XOR bitmap + AND mask
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = ((height - 1 - y) * width + x) * 4; // BMP rows run bottom-up, BGRA
      const alpha = rgba[src + 3];
      // resvg's pixels are premultiplied, ICO bitmaps use straight alpha
      const straight = (c) => (alpha ? Math.min(255, Math.round((c * 255) / alpha)) : 0);
      pixels[dst] = straight(rgba[src + 2]);
      pixels[dst + 1] = straight(rgba[src + 1]);
      pixels[dst + 2] = straight(rgba[src]);
      pixels[dst + 3] = alpha;
    }
  }
  const mask = Buffer.alloc(Math.ceil(width / 32) * 4 * height); // all 0: alpha decides
  return Buffer.concat([header, pixels, mask]);
}

function buildIco() {
  const entries = ICO_SIZES.map((size) => {
    const image = render(WINDOWS, size);
    return { size, data: size >= 256 ? image.png : bmpEntry(image) };
  });
  const header = Buffer.alloc(6 + 16 * entries.length);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  let offset = header.length;
  entries.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, at); // 0 means 256
    header.writeUInt8(size >= 256 ? 0 : size, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...entries.map((e) => e.data)]);
}

function buildIcns() {
  const chunks = ICNS_TYPES.map(([type, size]) => {
    const png = render(MAC, size).png;
    const head = Buffer.alloc(8);
    head.write(type, 0, 'ascii');
    head.writeUInt32BE(png.length + 8, 4);
    return Buffer.concat([head, png]);
  });
  const head = Buffer.alloc(8);
  head.write('icns', 0, 'ascii');
  head.writeUInt32BE(8 + chunks.reduce((sum, c) => sum + c.length, 0), 4);
  return Buffer.concat([head, ...chunks]);
}

function write(relativePath, data) {
  fs.writeFileSync(path.join(RESOURCES, relativePath), data);
  console.log(`wrote resources/${relativePath}`);
}

function writeAppxAssets() {
  const dir = path.join(RESOURCES, 'appx');
  // electron-builder packs every file in this folder, so drop assets of earlier icon versions
  for (const name of fs.readdirSync(dir)) if (name.endsWith('.png')) fs.rmSync(path.join(dir, name));
  for (const [name, size] of APPX_SCALED) {
    for (const scale of APPX_SCALES) {
      write(path.join('appx', `${name}.scale-${scale}.png`), render(WINDOWS, Math.round((size * scale) / 100)).png);
    }
  }
  // Without the unplated variants Windows puts the app icon on a system plate in the taskbar
  for (const size of APPX_TARGET_SIZES) {
    const base = `Square44x44Logo.targetsize-${size}`;
    write(path.join('appx', `${base}.png`), render(WINDOWS, size).png);
    write(path.join('appx', `${base}_altform-unplated.png`), render(UNPLATED_DARK_THEME, size).png);
    write(path.join('appx', `${base}_altform-lightunplated.png`), render(UNPLATED_LIGHT_THEME, size).png);
  }
  // The manifest electron-builder writes always names a wide tile; no design for it, so the
  // square tile sits in its middle
  write(path.join('appx', 'Wide310x150Logo.png'), render(WINDOWS, 310, 150).png);
}

write('icon.ico', buildIco());
write('icon.png', render(WINDOWS, 1024).png);
write('icon.icns', buildIcns());
fs.mkdirSync(path.join(RESOURCES, 'store'), { recursive: true });
write(path.join('store', 'AppTileIcon-300.png'), render(WINDOWS, 300).png);
writeAppxAssets();
