import * as exifr from 'exifr';

export type ExifCategory = 'Portrait' | 'Street' | 'Event' | 'Nature' | 'Other';

export interface ExifSummary {
  shutterSpeed?: string;
  iso?: number;
  aperture?: string;
  camera?: string;
  lens?: string;
  focalLengthMm?: number;
  focalLength35Mm?: number;
  width?: number;
  height?: number;
  flashFired?: boolean;
}

const exifCache = new Map<string, Promise<ExifSummary | null>>();

function pickNumber(data: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function pickString(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function formatShutterSpeed(exposureTime?: number): string | undefined {
  if (!exposureTime || !Number.isFinite(exposureTime) || exposureTime <= 0) return;

  if (exposureTime >= 1) {
    const rounded = Math.round(exposureTime * 10) / 10;
    return `${rounded}s`;
  }

  const denom = Math.round(1 / exposureTime);
  if (!Number.isFinite(denom) || denom <= 0) return;
  return `1/${denom}`;
}

function formatAperture(fNumber?: number): string | undefined {
  if (!fNumber || !Number.isFinite(fNumber) || fNumber <= 0) return;
  const rounded = Math.round(fNumber * 10) / 10;
  return `f/${rounded}`;
}

function formatCamera(make?: string, model?: string): string | undefined {
  const safeMake = (make ?? '').trim();
  const safeModel = (model ?? '').trim();

  if (safeModel && safeMake) {
    const lowerMake = safeMake.toLowerCase();
    const lowerModel = safeModel.toLowerCase();
    // Some cameras store Model already prefixed with Make (e.g., "Canon EOS RP").
    if (lowerModel.startsWith(lowerMake)) return safeModel;
  }

  const combined = `${safeMake} ${safeModel}`.trim();
  return combined || undefined;
}

function pickLens(lensModel?: string, lens?: string): string | undefined {
  const a = (lensModel ?? '').trim();
  if (a) return a;
  const b = (lens ?? '').trim();
  return b || undefined;
}

async function fetchArrayBuffer(src: string): Promise<ArrayBuffer> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${src} (${response.status})`);
  }
  return await response.arrayBuffer();
}

/**
 * Reads a small, UI-friendly subset of EXIF from an image URL (typically `/images/...`).
 * Returns `null` when metadata can't be read (e.g. stripped EXIF).
 */
export function getExifSummary(src: string): Promise<ExifSummary | null> {
  if (exifCache.has(src)) return exifCache.get(src)!;

  const promise = (async () => {
    try {
      const buffer = await fetchArrayBuffer(src);

      const parsed = (await exifr.parse(buffer, {
        tiff: true,
        exif: true,
      })) as Record<string, unknown> | null;

      if (!parsed) return null;

      const exposureTime = pickNumber(parsed, 'ExposureTime', 'exposureTime');
      const fNumber = pickNumber(parsed, 'FNumber', 'fNumber');
      const iso = pickNumber(parsed, 'ISO', 'ISOSpeedRatings', 'ISOSpeedRating', 'iso');

      const make = pickString(parsed, 'Make', 'make');
      const model = pickString(parsed, 'Model', 'model');

      const lensModel = pickString(parsed, 'LensModel', 'lensModel');
      const lens = pickString(parsed, 'Lens', 'lens');

      const focalLength = pickNumber(parsed, 'FocalLength', 'focalLength');
      const focalLength35 = pickNumber(parsed, 'FocalLengthIn35mmFormat', 'focalLengthIn35mmFormat');

      const width = pickNumber(parsed, 'ExifImageWidth', 'ImageWidth', 'imageWidth');
      const height = pickNumber(parsed, 'ExifImageHeight', 'ImageHeight', 'imageHeight');

      const flash = pickNumber(parsed, 'Flash', 'flash');
      const flashFired = typeof flash === 'number' ? (flash & 1) === 1 : undefined;

      const summary: ExifSummary = {
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

      return summary;
    } catch {
      return null;
    }
  })();

  exifCache.set(src, promise);
  return promise;
}
