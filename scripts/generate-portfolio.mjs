import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import exifr from 'exifr';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function folderToCategoryLabel(folderName) {
  const raw = String(folderName ?? '').trim();
  if (!raw) return null;

  const words = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/g)
    .filter(Boolean);

  if (words.length === 0) return null;
  return words.map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(' ');
}

function fileToLabel(fileName) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .toUpperCase();
}

function formatShutterSpeed(exposureTime) {
  if (!exposureTime || !Number.isFinite(exposureTime) || exposureTime <= 0) return undefined;
  if (exposureTime >= 1) {
    const rounded = Math.round(exposureTime * 10) / 10;
    return `${rounded}s`;
  }
  const denom = Math.round(1 / exposureTime);
  if (!Number.isFinite(denom) || denom <= 0) return undefined;
  return `1/${denom}`;
}

function formatAperture(fNumber) {
  if (!fNumber || !Number.isFinite(fNumber) || fNumber <= 0) return undefined;
  const rounded = Math.round(fNumber * 10) / 10;
  return `f/${rounded}`;
}

function formatCamera(make, model) {
  const safeMake = (make ?? '').trim();
  const safeModel = (model ?? '').trim();

  if (safeModel && safeMake) {
    const lowerMake = safeMake.toLowerCase();
    const lowerModel = safeModel.toLowerCase();
    if (lowerModel.startsWith(lowerMake)) return safeModel;
  }

  const combined = `${safeMake} ${safeModel}`.trim();
  return combined || undefined;
}

function pickLens(lensModel, lens) {
  const a = (lensModel ?? '').trim();
  if (a) return a;
  const b = (lens ?? '').trim();
  return b || undefined;
}

function categorizeImage({ exif, fileName }) {
  const name = (fileName ?? '').toLowerCase();

  if (/(portrait|headshot|model)/.test(name)) return 'Portrait';
  if (/(street|urban|city)/.test(name)) return 'Street';
  if (/(event|wedding|party|concert)/.test(name)) return 'Event';
  if (/(nature|forest|mountain|sea|beach|landscape)/.test(name)) return 'Nature';

  const iso = exif?.iso;
  const effectiveFocal = typeof exif?.focalLength35Mm === 'number' ? exif.focalLength35Mm : exif?.focalLengthMm;
  const portraitOrientation =
    typeof exif?.width === 'number' && typeof exif?.height === 'number' ? exif.height > exif.width : false;

  const fNumber = typeof exif?.aperture === 'string' ? Number(exif.aperture.replace(/^f\//, '')) : undefined;

  // Portrait
  if (
    (typeof effectiveFocal === 'number' && effectiveFocal >= 70) ||
    (portraitOrientation && typeof effectiveFocal === 'number' && effectiveFocal >= 50) ||
    (typeof fNumber === 'number' && fNumber > 0 && fNumber <= 2.8 && portraitOrientation)
  ) {
    return 'Portrait';
  }

  // Nature
  if ((typeof effectiveFocal === 'number' && effectiveFocal <= 24) || (typeof effectiveFocal === 'number' && effectiveFocal >= 200)) {
    return 'Nature';
  }

  // Event
  if ((typeof iso === 'number' && iso >= 1600) || exif?.flashFired) {
    return 'Event';
  }

  // Street
  if (typeof effectiveFocal === 'number' && effectiveFocal >= 24 && effectiveFocal <= 70) {
    return 'Street';
  }

  return 'Other';
}

const OVERRIDES_FILE = path.join(process.cwd(), 'scripts', 'portfolio.overrides.json');

async function readOverrides() {
  try {
    const raw = await fs.readFile(OVERRIDES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function mergeExif(exif, overrideExif) {
  if (!overrideExif || typeof overrideExif !== 'object') return exif;
  const base = exif && typeof exif === 'object' ? exif : {};
  return { ...base, ...overrideExif };
}

function normalizeExifSummary(exif) {
  if (!exif || typeof exif !== 'object') return exif;
  const out = { ...exif };

  if (typeof out.iso === 'string') {
    const parsed = Number(out.iso);
    out.iso = Number.isFinite(parsed) ? Math.round(parsed) : undefined;
  }
  if (typeof out.iso === 'number' && !Number.isFinite(out.iso)) {
    out.iso = undefined;
  }

  return out;
}

async function listImageFiles(imagesDir) {
  /** @type {{absPath: string, fileName: string, relDir: string}[]} */
  const out = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }

      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      const rel = path.relative(imagesDir, abs);
      const relDir = path.dirname(rel).replace(/\\/g, '/');
      out.push({ absPath: abs, fileName: entry.name, relDir: relDir === '.' ? '' : relDir });
    }
  }

  await walk(imagesDir);

  out.sort((a, b) => {
    if (a.fileName !== b.fileName) return a.fileName.localeCompare(b.fileName);
    return a.absPath.localeCompare(b.absPath);
  });

  return out;
}

async function readExifSummary(filePath) {
  try {
    const data = await exifr.parse(filePath, { tiff: true, exif: true });
    if (!data) return null;

    const exposureTime = data.ExposureTime ?? data.exposureTime;
    const fNumber = data.FNumber ?? data.fNumber;
    const iso = data.ISO ?? data.ISOSpeedRatings ?? data.ISOSpeedRating ?? data.iso;

    const make = data.Make ?? data.make;
    const model = data.Model ?? data.model;

    const lensModel = data.LensModel ?? data.lensModel;
    const lens = data.Lens ?? data.lens;

    const focalLength = data.FocalLength ?? data.focalLength;
    const focalLength35 = data.FocalLengthIn35mmFormat ?? data.focalLengthIn35mmFormat;

    const width = data.ExifImageWidth ?? data.ImageWidth ?? data.imageWidth;
    const height = data.ExifImageHeight ?? data.ImageHeight ?? data.imageHeight;

    const flash = data.Flash ?? data.flash;
    const flashFired = typeof flash === 'number' ? (flash & 1) === 1 : undefined;

    return {
      shutterSpeed: formatShutterSpeed(exposureTime),
      iso: typeof iso === 'number' && Number.isFinite(iso) ? Math.round(iso) : undefined,
      aperture: formatAperture(fNumber),
      camera: formatCamera(make, model),
      lens: pickLens(lensModel, lens),
      focalLengthMm: typeof focalLength === 'number' ? focalLength : undefined,
      focalLength35Mm: typeof focalLength35 === 'number' ? focalLength35 : undefined,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      flashFired,
    };
  } catch {
    return null;
  }
}

function toTsLiteral(value) {
  return JSON.stringify(value, null, 2);
}

function normalizeTags(value) {
  const rawList = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const out = [];
  const seen = new Set();
  for (const v of rawList) {
    if (typeof v !== 'string') continue;
    const tag = v.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

async function main() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const outFile = path.join(process.cwd(), 'src', 'data', 'portfolioItems.generated.ts');
  const overrides = await readOverrides();

  const files = await listImageFiles(imagesDir);
  if (files.length === 0) {
    console.error('No images found in public/images');
  }

  const items = [];
  for (let index = 0; index < files.length; index++) {
    const { fileName, absPath, relDir } = files[index];

    const override = overrides?.[fileName] ?? null;

    const overrideCategory =
      typeof override?.category === 'string' && override.category.trim() ? override.category.trim() : null;

    const folderCategory = relDir ? folderToCategoryLabel(relDir.split('/')[0]) : null;

    const exif = await readExifSummary(absPath);
    const finalExif = normalizeExifSummary(mergeExif(exif, override?.exif));

    const inferredCategory = categorizeImage({ exif: finalExif, fileName });
    const finalCategory = overrideCategory ?? folderCategory ?? inferredCategory;

    const label = typeof override?.label === 'string' && override.label.trim()
      ? override.label.trim()
      : fileToLabel(fileName);

    const alt = typeof override?.alt === 'string' && override.alt.trim()
      ? override.alt.trim()
      : `Portfolio image ${label}`;

    const hideOnHome = Boolean(override?.hideOnHome);
    const tags = normalizeTags(override?.tags);

    items.push({
      id: index + 1,
      src: relDir ? `/images/${relDir}/${fileName}` : `/images/${fileName}`,
      fileName,
      label,
      alt,
      category: finalCategory,
      hideOnHome,
      tags,
      exif: finalExif,
    });
  }

  const categories = Array.from(new Set(items.map((i) => i.category))).sort((a, b) => a.localeCompare(b));

  const header = `/* eslint-disable */\n// This file is auto-generated by scripts/generate-portfolio.mjs\n// Do not edit manually.\n\n`;
  const categoryUnion = categories.map((c) => JSON.stringify(c)).join(' | ') || 'string';
  const content =
    header +
    `export type PortfolioCategory = ${categoryUnion};\n\n` +
    `export interface ExifSummary {\n` +
    `  shutterSpeed?: string;\n` +
    `  iso?: number;\n` +
    `  aperture?: string;\n` +
    `  camera?: string;\n` +
    `  lens?: string;\n` +
    `  focalLengthMm?: number;\n` +
    `  focalLength35Mm?: number;\n` +
    `  width?: number;\n` +
    `  height?: number;\n` +
    `  flashFired?: boolean;\n` +
    `}\n\n` +
    `export interface PortfolioItem {\n` +
    `  id: number;\n` +
    `  src: string;\n` +
    `  fileName: string;\n` +
    `  alt: string;\n` +
    `  label: string;\n` +
    `  category: PortfolioCategory;\n` +
    `  hideOnHome?: boolean;\n` +
    `  tags?: string[];\n` +
    `  exif: ExifSummary | null;\n` +
    `}\n\n` +
    `export const portfolioItems: PortfolioItem[] = ${toTsLiteral(items)} as const;\n\n` +
    `export const portfolioCategories: PortfolioCategory[] = ${toTsLiteral(categories)} as const;\n\n` +
    `export default portfolioItems;\n`;

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, content, 'utf8');
  console.log(`Generated ${path.relative(process.cwd(), outFile)} with ${items.length} items.`);
}

await main();
