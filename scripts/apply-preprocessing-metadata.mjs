import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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

function hasNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function pickPreferredString(draftValue, suggestedValue) {
  if (hasNonEmptyString(draftValue)) return String(draftValue).trim();
  if (hasNonEmptyString(suggestedValue)) return String(suggestedValue).trim();
  return '';
}

function isMissingTags(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function mergeExifFillOnly(existingExif, draftExif) {
  const base = isObject(existingExif) ? { ...existingExif } : {};
  if (!isObject(draftExif)) return base;

  for (const [key, value] of Object.entries(draftExif)) {
    if (value === undefined || value === null) continue;
    if (base[key] === undefined || base[key] === null || base[key] === '') {
      base[key] = value;
    }
  }

  return base;
}

async function main() {
  const metadata = await readJson(METADATA_FILE);
  if (Object.keys(metadata).length === 0) {
    console.error('Missing or empty preprocessing.metadata.json. Run `npm run pre:meta` first.');
    process.exitCode = 1;
    return;
  }

  const overrides = await readJson(OVERRIDES_FILE);

  let changed = 0;
  let touched = 0;

  for (const [fileName, entry] of Object.entries(metadata)) {
    if (!isObject(entry) || entry.present === false) continue;
    const draft = isObject(entry.draft) ? entry.draft : {};
    const suggested = isObject(entry.suggested) ? entry.suggested : {};
    const exifExtracted = isObject(entry.exifExtracted) ? entry.exifExtracted : {};

    if (!isObject(overrides[fileName])) overrides[fileName] = {};
    const existing = overrides[fileName];

    const before = JSON.stringify(existing);

    // Strings: fill only if missing/empty. Prefer draft, then suggested.
    const preferredCategory = pickPreferredString(draft.category, '');
    const preferredLabel = pickPreferredString(draft.label, suggested.label);
    const preferredAlt = pickPreferredString(draft.alt, suggested.alt);

    if (!hasNonEmptyString(existing.category) && hasNonEmptyString(preferredCategory)) {
      existing.category = preferredCategory;
    }
    if (!hasNonEmptyString(existing.label) && hasNonEmptyString(preferredLabel)) {
      existing.label = preferredLabel;
    }
    if (!hasNonEmptyString(existing.alt) && hasNonEmptyString(preferredAlt)) {
      existing.alt = preferredAlt;
    }

    // tags: allow string or string[]. Fill if missing/empty.
    if (isMissingTags(existing.tags) && (typeof draft.tags === 'string' || Array.isArray(draft.tags))) {
      existing.tags = draft.tags;
    }

    // hideOnHome: fill only if not set.
    if (existing.hideOnHome === undefined && typeof draft.hideOnHome === 'boolean') {
      existing.hideOnHome = draft.hideOnHome;
    }

    // exif: fill per-field only. Prefer draft.exif, then exifExtracted.
    const preferredExif = isObject(draft.exif) && Object.keys(draft.exif).length > 0
      ? draft.exif
      : exifExtracted;

    if (preferredExif !== undefined) {
      existing.exif = mergeExifFillOnly(existing.exif, preferredExif);
      // If empty object after merge, omit it.
      if (isObject(existing.exif) && Object.keys(existing.exif).length === 0) {
        delete existing.exif;
      }
    }

    const after = JSON.stringify(existing);
    touched++;
    if (before !== after) changed++;
  }

  // Keep overrides stable: write keys sorted.
  const sorted = Object.fromEntries(
    Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))
  );

  await writeJson(OVERRIDES_FILE, sorted);

  console.log(
    `Applied preprocessing metadata into overrides: changed=${changed} entries (touched=${touched}).`
  );
}

await main();
