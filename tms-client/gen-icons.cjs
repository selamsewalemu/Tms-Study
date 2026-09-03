const fs   = require("fs");
const path = require("path");
const zlib = require("zlib");

function makePng(size) {
  const w = size, h = size;
  const raw = Buffer.alloc(h * (1 + w * 4));

  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const t    = x / Math.max(w - 1, 1);
      const r    = Math.round(99  + (56  - 99)  * t);
      const g    = Math.round(102 + (189 - 102) * t);
      const b    = Math.round(241 + (248 - 241) * t);
      const pad  = w * 0.12;
      const inside = x >= pad && x < w - pad && y >= pad && y < h - pad;
      const a    = inside ? 255 : 0;

      const cx = w / 2, cy = h / 2;
      const lw = w * 0.55, lh = Math.max(h * 0.07, 1), gap = h * 0.13;
      const line1 = inside && Math.abs(y - (cy - gap)) < lh && Math.abs(x - cx) < lw / 2;
      const line2 = inside && Math.abs(y - cy)         < lh && Math.abs(x - cx) < lw / 2 * 0.65;
      const line3 = inside && Math.abs(y - (cy + gap)) < lh && Math.abs(x - cx) < lw / 2 * 0.75;
      const white = line1 || line2 || line3;

      const off = y * (w * 4 + 1) + 1 + x * 4;
      raw[off]     = white ? 255 : r;
      raw[off + 1] = white ? 255 : g;
      raw[off + 2] = white ? 255 : b;
      raw[off + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  const CRC_TABLE = [];
  for (let i = 0; i < 256; i++) {
    let v = i;
    for (let j = 0; j < 8; j++) v = (v & 1) ? (0xEDB88320 ^ (v >>> 1)) : (v >>> 1);
    CRC_TABLE[i] = v;
  }
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);  len.writeUInt32BE(data.length);
    const tc  = Buffer.from(type);
    const crc = Buffer.alloc(4);  crc.writeUInt32BE(crc32(Buffer.concat([tc, data])));
    return Buffer.concat([len, tc, data, crc]);
  }

  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

const dir = path.join(__dirname, "src", "icons");
fs.mkdirSync(dir, { recursive: true });

[72, 96, 128, 144, 152, 192, 384, 512].forEach(s => {
  fs.writeFileSync(path.join(dir, `icon-${s}x${s}.png`), makePng(s));
  console.log(`  icon-${s}x${s}.png`);
});

// Screenshot placeholders
const wide    = makePng(72);
const narrow  = makePng(72);
fs.writeFileSync(path.join(dir, "screenshot-wide.png"),   wide);
fs.writeFileSync(path.join(dir, "screenshot-narrow.png"), narrow);

console.log("All icons generated.");
