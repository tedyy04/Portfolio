import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);

const MAX_DIM = Number(process.env.MAX_DIM ?? 2400);
const JPEG_QUALITY = Number(process.env.JPEG_QUALITY ?? 82);

const PREPROCESSING_DIR = path.join(process.cwd(), 'preprocessing');
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

function randInt(minInclusive, maxInclusive) {
  const range = maxInclusive - minInclusive + 1;
  const value = crypto.randomInt(range) + minInclusive;
  return value;
}

function pickUniqueNumber(used, min = 1, max = 1000) {
  if (used.size >= (max - min + 1)) {
    throw new Error(`Ran out of unique numbers in range ${min}-${max}`);
  }
  let n = randInt(min, max);
  while (used.has(n)) n = randInt(min, max);
  used.add(n);
  return n;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listImageFilesFlat(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

async function scanUsedTedNumbers(rootDir) {
  const used = new Set();

  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;

      const match = entry.name.match(/^ted_(\d+)\.(jpe?g|png|webp|gif)$/i);
      if (!match) continue;
      used.add(Number(match[1]));
    }
  }

  await walk(rootDir);
  return used;
}

function normalizeTargetExt(sourceExt) {
  void sourceExt;
  return '.jpeg';
}

async function ensureValidConfig() {
  if (!Number.isFinite(MAX_DIM) || MAX_DIM <= 0) {
    throw new Error(`Invalid MAX_DIM: ${process.env.MAX_DIM}`);
  }
  if (!Number.isFinite(JPEG_QUALITY) || JPEG_QUALITY < 1 || JPEG_QUALITY > 100) {
    throw new Error(`Invalid JPEG_QUALITY: ${process.env.JPEG_QUALITY}`);
  }
}

async function convertResizeToJpeg({ inputAbs, outputAbs }) {
  // `sips` is available by default on macOS.
  // We output to a new file to keep operations safe and collision-free.
  const args = [
    '-Z',
    String(MAX_DIM),
    '-s',
    'format',
    'jpeg',
    '-s',
    'formatOptions',
    String(JPEG_QUALITY),
    inputAbs,
    '--out',
    outputAbs,
  ];

  await execFileAsync('sips', args);
}

async function main() {
  await ensureValidConfig();

  if (!(await exists(PREPROCESSING_DIR))) {
    console.error('Missing preprocessing/ folder at repo root');
    process.exitCode = 1;
    return;
  }

  const files = await listImageFilesFlat(PREPROCESSING_DIR);
  if (files.length === 0) {
    console.log('No images found in preprocessing/');
    return;
  }

  // Avoid collisions with existing ted_### anywhere in public/images as well.
  const usedNumbers = new Set([
    ...(await scanUsedTedNumbers(PUBLIC_IMAGES_DIR)),
    ...(await scanUsedTedNumbers(PREPROCESSING_DIR)),
  ]);

  /** @type {{oldName: string, preparedName: string, finalName: string, keepNumber: number | null}[]} */
  const ops = [];

  // Track numbers claimed by files that already have a ted_### number.
  const claimed = new Set();

  for (const oldName of files) {
    const match = oldName.match(/^ted_(\d+)\.(jpe?g|png|webp|gif|heic|heif)$/i);
    const keepNumber = match ? Number(match[1]) : null;
    if (typeof keepNumber === 'number' && Number.isFinite(keepNumber)) {
      if (claimed.has(keepNumber)) {
        throw new Error(`Duplicate ted number in preprocessing/: ted_${keepNumber}`);
      }
      claimed.add(keepNumber);
    }

    const ext = normalizeTargetExt(path.extname(oldName));
    const preparedName = `.__prepared__${oldName.replace(/[^a-z0-9_.-]/gi, '_')}${ext}`;
    ops.push({ oldName, preparedName, finalName: '', keepNumber });
  }

  if (ops.length === 0) {
    console.log('No supported images found in preprocessing/.');
    return;
  }

  // Reserve kept numbers so random picks won't use them.
  for (const n of claimed) usedNumbers.add(n);

  for (const op of ops) {
    const n = op.keepNumber ?? pickUniqueNumber(usedNumbers, 1, 1000);
    op.finalName = `ted_${n}.jpeg`;
  }

  // Preflight: ensure targets don't already exist.
  for (const op of ops) {
    const preparedAbs = path.join(PREPROCESSING_DIR, op.preparedName);
    const finalAbs = path.join(PREPROCESSING_DIR, op.finalName);
    if (await exists(preparedAbs)) {
      throw new Error(`Temp output already exists in preprocessing/: ${op.preparedName}`);
    }
    if (await exists(finalAbs)) {
      // If final already exists, we risk overwriting. Require manual cleanup.
      throw new Error(`Target already exists in preprocessing/: ${op.finalName}`);
    }
  }

  // 1) Convert + resize every source image to a prepared JPEG.
  for (const op of ops) {
    const inputAbs = path.join(PREPROCESSING_DIR, op.oldName);
    const outputAbs = path.join(PREPROCESSING_DIR, op.preparedName);
    await convertResizeToJpeg({ inputAbs, outputAbs });
    await fs.unlink(inputAbs);
  }

  // 2) Rename prepared files to final ted_###.jpeg.
  for (const op of ops) {
    const preparedAbs = path.join(PREPROCESSING_DIR, op.preparedName);
    const finalAbs = path.join(PREPROCESSING_DIR, op.finalName);
    await fs.rename(preparedAbs, finalAbs);
  }

  console.log(`Prepared ${ops.length} images in preprocessing/ (resize+convert+rename):`);
  console.log(`- MAX_DIM=${MAX_DIM}`);
  console.log(`- JPEG_QUALITY=${JPEG_QUALITY}`);
  for (const op of ops) {
    console.log(`- ${op.oldName} -> ${op.finalName}`);
  }
}

await main();
