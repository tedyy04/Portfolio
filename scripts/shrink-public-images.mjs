import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif']);

const MAX_DIM = Number(process.env.MAX_DIM ?? 2400);
const JPEG_QUALITY = Number(process.env.JPEG_QUALITY ?? 82);
const DRY_RUN = String(process.env.DRY_RUN ?? '').trim() === '1';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listImagesRecursive(rootDir) {
  /** @type {string[]} */
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
      out.push(abs);
    }
  }

  await walk(rootDir);
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

async function sipsShrinkInPlace(absPath) {
  const ext = path.extname(absPath).toLowerCase();

  // Notes:
  // - `-Z` resizes while preserving aspect ratio.
  // - For JPEG/HEIC, setting `formatOptions` controls compression quality.
  // - We don't force format conversion here to avoid changing filenames.
  const args = ['-Z', String(MAX_DIM)];

  if (ext === '.jpg' || ext === '.jpeg' || ext === '.heic' || ext === '.heif') {
    args.push('-s', 'formatOptions', String(JPEG_QUALITY));
  }

  args.push(absPath);

  if (DRY_RUN) {
    console.log(`[dry-run] sips ${args.map((a) => JSON.stringify(a)).join(' ')}`);
    return;
  }

  await execFileAsync('sips', args);
}

async function main() {
  if (!(await exists(PUBLIC_IMAGES_DIR))) {
    console.error('Missing public/images folder');
    process.exitCode = 1;
    return;
  }

  if (!Number.isFinite(MAX_DIM) || MAX_DIM <= 0) {
    console.error(`Invalid MAX_DIM: ${process.env.MAX_DIM}`);
    process.exitCode = 1;
    return;
  }

  if (!Number.isFinite(JPEG_QUALITY) || JPEG_QUALITY < 1 || JPEG_QUALITY > 100) {
    console.error(`Invalid JPEG_QUALITY: ${process.env.JPEG_QUALITY}`);
    process.exitCode = 1;
    return;
  }

  const files = await listImagesRecursive(PUBLIC_IMAGES_DIR);
  if (files.length === 0) {
    console.log('No supported images found under public/images');
    return;
  }

  console.log(`Shrinking ${files.length} images under public/images (MAX_DIM=${MAX_DIM}, JPEG_QUALITY=${JPEG_QUALITY})`);
  if (!DRY_RUN) {
    console.log('This modifies files in-place. Consider backing up originals first.');
  }

  let ok = 0;
  let failed = 0;

  for (const absPath of files) {
    const rel = path.relative(process.cwd(), absPath);
    try {
      await sipsShrinkInPlace(absPath);
      ok += 1;
      if (ok % 25 === 0) console.log(`...processed ${ok}/${files.length}`);
    } catch (err) {
      failed += 1;
      console.error(`Failed: ${rel}`);
      console.error(err);
    }
  }

  console.log(`Done. ok=${ok}, failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

await main();
