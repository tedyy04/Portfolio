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

function cleanExif(exif) {
  if (!exif || typeof exif !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(exif)) {
    if (v !== null && v !== undefined && v !== '') {
      out[k] = v;
    }
  }
  return out;
}

async function readExifSummary(filePath) {
  try {
    const data = await exifr.parse(filePath, { tiff: true, exif: true });
    if (!data) return {};

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

    const raw = {
      camera: formatCamera(make, model),
      lens: pickLens(lensModel, lens),
      aperture: formatAperture(fNumber),
      shutterSpeed: formatShutterSpeed(exposureTime),
      iso: typeof iso === 'number' && Number.isFinite(iso) ? Math.round(iso) : undefined,
      focalLengthMm: typeof focalLength === 'number' ? focalLength : undefined,
      focalLength35Mm: typeof focalLength35 === 'number' ? focalLength35 : undefined,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      flashFired: typeof flashFired === 'boolean' ? flashFired : undefined,
    };

    return cleanExif(raw);
  } catch {
    return {};
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
  const existingMetadata = await readJson(METADATA_FILE);
  const overrides = await readJson(OVERRIDES_FILE);

  let files = [];
  try {
    files = await listImagesFlat(PREPROCESSING_DIR);
  } catch {
    console.error('Missing preprocessing/ folder at repo root');
    process.exitCode = 1;
    return;
  }

  if (files.length === 0) {
    console.log('No images found in preprocessing/. Nothing to extract.');
    return;
  }

  /** @type {Record<string, any>} */
  const next = {};

  for (const fileName of files) {
    const absPath = path.join(PREPROCESSING_DIR, fileName);

    const prev = isObject(existingMetadata[fileName]) ? existingMetadata[fileName] : {};
    const override = isObject(overrides[fileName]) ? overrides[fileName] : {};

    const labelFallback = fileToLabel(fileName);
    const extractedExif = await readExifSummary(absPath);

    // Merge EXIF: extracted < override < user edits in metadata file
    const mergedExif = cleanExif({
      ...extractedExif,
      ...(isObject(override.exif) ? override.exif : {}),
      ...(isObject(prev.exif) ? prev.exif : {}),
    });

    const category = typeof prev.category === 'string' && prev.category.trim()
      ? prev.category.trim()
      : (typeof override.category === 'string' ? override.category.trim() : '');

    const label = typeof prev.label === 'string' && prev.label.trim()
      ? prev.label.trim()
      : (typeof override.label === 'string' && override.label.trim() ? override.label.trim() : labelFallback);

    const alt = typeof prev.alt === 'string' && prev.alt.trim()
      ? prev.alt.trim()
      : (typeof override.alt === 'string' && override.alt.trim() ? override.alt.trim() : normalizeAlt('', label));

    const tags = prev.tags !== undefined
      ? prev.tags
      : (override.tags !== undefined ? override.tags : '');

    const hideOnHome = prev.hideOnHome !== undefined
      ? Boolean(prev.hideOnHome)
      : Boolean(override.hideOnHome);

    next[fileName] = {
      category,
      label,
      alt,
      tags,
      hideOnHome,
      exif: mergedExif,
    };
  }

  // Keep keys sorted by file name
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  await writeJson(METADATA_FILE, sorted);

  console.log(`Generated metadata for ${files.length} image(s) in ${path.relative(process.cwd(), METADATA_FILE)}.`);
}

await main();
