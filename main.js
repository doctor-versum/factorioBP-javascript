const fs = require('fs');
const { PNG } = require('pngjs');

function saveRgbImageAsPng(buffer, width, height, outPath) {
  // PNG mit alpha-Kanal anlegen
  const png = new PNG({ width, height });

  // RGB-Buffer (3 bytes pro pixel) in PNG-Buffer (4 bytes pro pixel) kopieren
  for (let i = 0; i < width * height; i++) {
    const rgbIndex = i * 3;
    const pngIndex = i * 4;

    png.data[pngIndex]     = buffer[rgbIndex];     // R
    png.data[pngIndex + 1] = buffer[rgbIndex + 1]; // G
    png.data[pngIndex + 2] = buffer[rgbIndex + 2]; // B
    png.data[pngIndex + 3] = 255;                  // A (voll sichtbar)
  }

  // PNG schreiben
  png.pack().pipe(fs.createWriteStream(outPath));
}

// Log-Funktion, die auch Errors schreibt
function logError(err) {
  const message = `[${new Date().toISOString()}] ${err.stack || err}\n`;
  fs.appendFileSync('error.log', message, 'utf8'); // hängt an error.log an
  console.error(err); // optional noch in der Konsole anzeigen
}

const zlib = require('zlib');

function decodeFactorioBlueprint(base64) {
  // 1. Base64 → Buffer
  const buffer = Buffer.from(base64, 'base64');

  // 2. zlib-dekomprimieren
  const decompressed = zlib.inflateSync(buffer);

  // 3. Ergebnis als UTF-8-String
  return decompressed.toString('utf-8');
}

function drawEntitiesToImage(entities, specs, width, height) {
  const buffer = new Uint8ClampedArray(width * height * 3);
  buffer.fill(0); // schwarzer Hintergrund

  for (const entity of entities) {
    const spec = specs[entity.name];
    if (!spec) continue; // keine Definition → skip

    const { width: w, height: h, offsetX, offsetY, color } = spec;
    const rgb = hexToRgb(color);

    // Mittelpunkt (oder Entity-Position aus Factorio)
    const baseX = Math.floor(entity.position.x);
    const baseY = Math.floor(entity.position.y);

    // Obere linke Ecke der Maschine
    const startX = baseX + offsetX;
    const startY = baseY + offsetY;

    // Alle Tiles füllen
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = startX + dx;
        const py = startY + dy;

        // Bounds check
        if (px < 0 || py < 0 || px >= width || py >= height) continue;

        const index = (py * width + px) * 3;
        buffer[index]     = rgb.r;
        buffer[index + 1] = rgb.g;
        buffer[index + 2] = rgb.b;
      }
    }
  }

  return buffer;
}

// Helper für Hex → RGB
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

colors = {
    "pipe": "#666666",
    "pipe-to-ground": "#666666",
    "chemical-plant": "#00FF00",
    "turbo-transport-belt": "#007a31",
    "bulk-inserter": "#0089d8ff",
    "assembling-machine-3": "#ffff00"
}

try {
const decoded = decodeFactorioBlueprint("eNqdmM1u4yAUhV8lYjWVzMjg/zxAV7Oa7aiqiEMTVAwejKuJqrz7YKdp3NTYwCqyzfm4JudcSN7Bjve0VUxosH0HnSAt1BIeFNsP1//AtorACWxRdo4Aq6XowPaPGccOgvBhhCANBVugZP1KNXzpKQfDSLGnRovO0XSsPrXD2L894UyfQHQVc3qgYk/UaSLF56cIUKGZZvQy53hxehZ9s6PKsD/lLTPYCLSyM4Ol+Kg7/pmNlZvP81DGnRyvyNGyPFmRJ8vydEWOl+XZijxblucr8nRZXqzIi2V5uSLPl+XVF/nFrLIXezsIzYNQvFJIuVwIujmwPtKG1YTDlhMTJKsbzMIah1/9PzV+BBSt2RgPVlPYUK6ZOHzefr5phFQNGUL2vSDsvTTZWNCemVkuT8s57s3sulc7CbUiomul0nBn6rRnp7inp3P01JOOveiZJz3xot+StOv5K2Sio0qbJ1Zs/m3B5/0wN1nh7Lfsy0us+O1IydsJSsZhrUj96m+7MtAelSVXVSCvtHT62LFfWerByLFh2fQ48H2QpXHh0Dwi216YeneyEbVqrU5yth8PBfBFyQZydjjqwWp+DsOZa8yy6dJ9ydnQHB2Dhm+pJl1Hmx03mYANqY9MUJjYDfQx68qiTI9KfstQ3H3vXWs0s+twPfygZL2J4dD8osSlR+LQOCNsOXrFgS3drd4EBe5HjnjfbpD54X17Q+qHv9+szemCqsspwzJBbp8guv4iYKLt9ZzlE+fkF9Np5ki5d+WlQ+Wy17bSi1Dfp9971xzfN7axJ78KjZkbP41Dc+bIR6FBc+Tj0KQ58n2TXHjyfc/duSff9+RdLvGfIsA0bYY+8Pl/RQQ4MShz7/e4pW4ezZa6+fHY84NU5GEDN78m++8bVd1Iy3JcpVWVpRUu8zQ+n/8DYo6XJA=="); // Beispiel für "✓ à la mode"
console.log(decoded);
img = drawEntitiesToImage(JSON.parse(decoded)["blueprint"]["entities"], colors, 10, 20)
saveRgbImageAsPng(img, 10, 20, "output.png")
fs.writeFileSync('blueprint.json', JSON.stringify(JSON.parse(decoded), null, 4), 'utf8');
} catch (err) {
    logError(err)
}