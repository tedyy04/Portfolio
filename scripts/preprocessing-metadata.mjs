import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import exifr from 'exifr';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const PREPROCESSING_DIR = path.join(process.cwd(), 'preprocessing');
const METADATA_FILE = path.join(process.cwd(), 'scripts', 'preprocessing.metadata.json');
const OVERRIDES_FILE = path.join(process.cwd(), 'scripts', 'portfolio.overrides.json');

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
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

function emptyExif() {
  return {
    shutterSpeed: null,
    iso: null,
    aperture: null,
    camera: null,
    lens: null,
    focalLengthMm: null,
    focalLength35Mm: null,
    width: null,
    height: null,
    flashFired: null,
  };
}

async function readExifSummary(filePath) {
  try {
    const data = await exifr.parse(filePath, { tiff: true, exif: true });
    if (!data) return { found: false, exif: emptyExif() };

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

    const exif = {
      shutterSpeed: formatShutterSpeed(exposureTime) ?? null,
      iso: typeof iso === 'number' && Number.isFinite(iso) ? Math.round(iso) : null,
      aperture: formatAperture(fNumber) ?? null,
      camera: formatCamera(make, model) ?? null,
      lens: pickLens(lensModel, lens) ?? null,
      focalLengthMm: typeof focalLength === 'number' ? focalLength : null,
      focalLength35Mm: typeof focalLength35 === 'number' ? focalLength35 : null,
      width: typeof width === 'number' ? width : null,
      height: typeof height === 'number' ? height : null,
      flashFired: typeof flashFired === 'boolean' ? flashFired : null,
    };

    return { found: true, exif };
  } catch {
    return { found: false, exif: emptyExif() };
  }
}

async function listImagesFlat(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

function normalizeAlt(value, fallbackLabel) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (s) return s;
  return `Portfolio image ${fallbackLabel}`;
}

async function main() {
  const metadata = await readJson(METADATA_FILE);
  const overrides = await readJson(OVERRIDES_FILE);

  let files = [];
  try {
    files = await listImagesFlat(PREPROCESSING_DIR);
  } catch {
    console.error('Missing preprocessing/ folder at repo root');
    process.exitCode = 1;
    return;
  }

  const now = new Date().toISOString();
  const present = new Set(files);

  /** @type {Record<string, any>} */
  const next = isObject(metadata) ? { ...metadata } : {};

  // Mark existing entries that are no longer present.
  for (const [fileName, entry] of Object.entries(next)) {
    if (!isObject(entry)) continue;
    entry.present = present.has(fileName);
  }

  for (const fileName of files) {
    const absPath = path.join(PREPROCESSING_DIR, fileName);

    const existing = isObject(next[fileName]) ? next[fileName] : {};
    const draft = isObject(existing.draft) ? existing.draft : {};
    const notes = typeof existing.notes === 'string' ? existing.notes : '';

    const labelFallback = fileToLabel(fileName);
    const exifResult = await readExifSummary(absPath);
    const exifExtracted = exifResult.exif;
    const overrideSnapshot = isObject(overrides[fileName]) ? overrides[fileName] : null;

    next[fileName] = {
      present: true,
      updatedAt: now,
      suggested: {
        label: labelFallback,
        alt: normalizeAlt('', labelFallback),
        exif: exifExtracted,
      },
      overrideSnapshot,
      exifExtracted,
      exifFound: exifResult.found,
      draft: {
        // user-editable section (only this should be edited)
        label: typeof draft.label === 'string' ? draft.label : '',
        alt: typeof draft.alt === 'string' ? draft.alt : '',
        category: typeof draft.category === 'string' ? draft.category : '',
        tags: Array.isArray(draft.tags) || typeof draft.tags === 'string' ? draft.tags : '',
        hideOnHome: typeof draft.hideOnHome === 'boolean' ? draft.hideOnHome : undefined,
        exif: isObject(draft.exif) ? draft.exif : {},
      },
      notes,
    };
  }

  // Keep file stable: sort keys.
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  await writeJson(METADATA_FILE, sorted);

  console.log(`Wrote ${path.relative(process.cwd(), METADATA_FILE)} for ${files.length} preprocessing images.`);
}

await main();
