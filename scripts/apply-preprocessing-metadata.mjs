import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const METADATA_FILE = path.join(process.cwd(), 'scripts', 'preprocessing.metadata.json');
const OVERRIDES_FILE = path.join(process.cwd(), 'scripts', 'portfolio.overrides.json');
const PREPROCESSING_DIR = path.join(process.cwd(), 'preprocessing');
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

const KEEP_METADATA_FLAG = '--keep-metadata';
const NO_RESET_FLAG = '--no-reset';

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

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function hasNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isMissingTags(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function mergeExifFillOnly(existingExif, newExif) {
  const base = isObject(existingExif) ? { ...existingExif } : {};
  if (!isObject(newExif)) return base;

  for (const [key, value] of Object.entries(newExif)) {
    if (value === undefined || value === null || value === '') continue;
    if (base[key] === undefined || base[key] === null || base[key] === '') {
      base[key] = value;
    }
  }

  return base;
}

async function moveFileSafe(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    await fs.rename(src, dest);
  } catch (err) {
    if (err.code === 'EXDEV') {
      await fs.copyFile(src, dest);
      await fs.unlink(src);
    } else {
      throw err;
    }
  }
}

async function main() {
  const keepMetadata = process.argv.includes(KEEP_METADATA_FLAG) || process.argv.includes(NO_RESET_FLAG);

  const metadata = await readJson(METADATA_FILE);
  const fileNames = Object.keys(metadata);

  if (fileNames.length === 0) {
    console.error('Missing or empty preprocessing.metadata.json. Run `npm run pre:meta` first.');
    process.exitCode = 1;
    return;
  }

  const overrides = await readJson(OVERRIDES_FILE);

  let changed = 0;
  let touched = 0;
  let movedCount = 0;
  const remainingMetadata = {};

  for (const [fileName, entry] of Object.entries(metadata)) {
    if (!isObject(entry)) continue;

    if (!isObject(overrides[fileName])) overrides[fileName] = {};
    const existing = overrides[fileName];

    const before = JSON.stringify(existing);

    // 1. Strings: fill only if missing/empty in overrides
    if (!hasNonEmptyString(existing.category) && hasNonEmptyString(entry.category)) {
      existing.category = entry.category.trim();
    }
    if (!hasNonEmptyString(existing.label) && hasNonEmptyString(entry.label)) {
      existing.label = entry.label.trim();
    }
    if (!hasNonEmptyString(existing.alt) && hasNonEmptyString(entry.alt)) {
      existing.alt = entry.alt.trim();
    }

    // 2. Tags: fill if missing/empty
    if (isMissingTags(existing.tags) && !isMissingTags(entry.tags)) {
      existing.tags = Array.isArray(entry.tags) ? entry.tags : String(entry.tags).trim();
    }

    // 3. hideOnHome: fill only if not already set
    if (existing.hideOnHome === undefined && typeof entry.hideOnHome === 'boolean') {
      existing.hideOnHome = entry.hideOnHome;
    }

    // 4. EXIF: fill missing fields only
    if (isObject(entry.exif) && Object.keys(entry.exif).length > 0) {
      existing.exif = mergeExifFillOnly(existing.exif, entry.exif);
      if (isObject(existing.exif) && Object.keys(existing.exif).length === 0) {
        delete existing.exif;
      }
    }

    const after = JSON.stringify(existing);
    touched++;
    if (before !== after) changed++;

    // 5. Auto-move image to public/images/<category>/
    let fileWasMoved = false;
    const categoryName = hasNonEmptyString(entry.category)
      ? entry.category.trim()
      : (hasNonEmptyString(existing.category) ? existing.category.trim() : '');

    const srcPath = path.join(PREPROCESSING_DIR, fileName);

    if (categoryName && (await fileExists(srcPath))) {
      const categoryFolder = categoryName.toLowerCase().replace(/[^a-z0-9_-]+/g, '');
      const destDir = path.join(PUBLIC_IMAGES_DIR, categoryFolder);
      const destPath = path.join(destDir, fileName);

      try {
        await moveFileSafe(srcPath, destPath);
        console.log(`✓ Moved ${fileName} → public/images/${categoryFolder}/${fileName}`);
        movedCount++;
        fileWasMoved = true;
      } catch (err) {
        console.error(`✗ Failed to move ${fileName}:`, err.message);
      }
    } else if (!categoryName && (await fileExists(srcPath))) {
      console.log(`ℹ Notice: ${fileName} was not moved because no category was specified.`);
      remainingMetadata[fileName] = entry;
    }

    if (!fileWasMoved && keepMetadata) {
      remainingMetadata[fileName] = entry;
    }
  }

  // Keep overrides stable: sort keys
  const sortedOverrides = Object.fromEntries(
    Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))
  );
  await writeJson(OVERRIDES_FILE, sortedOverrides);

  // Update metadata file
  if (!keepMetadata) {
    await writeJson(METADATA_FILE, remainingMetadata);
  }

  console.log(`\nApplied preprocessing metadata:`);
  console.log(`- Overrides updated: ${changed} changed (out of ${touched} touched)`);
  console.log(`- Images auto-moved: ${movedCount}`);

  if (!keepMetadata) {
    if (Object.keys(remainingMetadata).length === 0) {
      console.log(`- Reset ${path.relative(process.cwd(), METADATA_FILE)} (all done).`);
    } else {
      console.log(`- Kept ${Object.keys(remainingMetadata).length} unmoved image(s) in ${path.relative(process.cwd(), METADATA_FILE)}.`);
    }
  }

  // 6. Regenerate portfolio and album data
  console.log('\nRegenerating portfolio data...');
  try {
    const { stdout } = await execAsync('node scripts/generate-portfolio.mjs && node scripts/generate-albums.mjs');
    if (stdout.trim()) console.log(stdout.trim());
    console.log('✓ Portfolio and album data regenerated successfully.');
  } catch (err) {
    console.warn('⚠️ Could not run regen script automatically:', err.message);
  }
}

await main();
