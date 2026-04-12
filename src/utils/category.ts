import type { ExifCategory, ExifSummary } from './exif';

export interface CategorizeInput {
  exif: ExifSummary | null;
  fileName?: string;
}

function isPortraitOrientation(exif: ExifSummary | null) {
  const w = exif?.width;
  const h = exif?.height;
  return typeof w === 'number' && typeof h === 'number' ? h > w : false;
}

/**
 * Best-effort automatic categorization.
 *
 * Notes:
 * - EXIF alone can't reliably infer semantic genres; this is heuristic.
 * - Returns one of: Portrait | Street | Event | Nature | Other.
 */
export function categorizeImage({ exif, fileName }: CategorizeInput): ExifCategory {
  const name = (fileName ?? '').toLowerCase();

  // Filename hints (if user names files meaningfully)
  if (/(portrait|headshot|model)/.test(name)) return 'Portrait';
  if (/(street|urban|city)/.test(name)) return 'Street';
  if (/(event|wedding|party|concert)/.test(name)) return 'Event';
  if (/(nature|forest|mountain|sea|beach|landscape)/.test(name)) return 'Nature';

  const iso = exif?.iso;
  const focal35 = exif?.focalLength35Mm;
  const focal = exif?.focalLengthMm;
  const fNumber = exif?.aperture ? Number(exif.aperture.replace(/^f\//, '')) : undefined;
  const portraitOrientation = isPortraitOrientation(exif);

  const effectiveFocal = typeof focal35 === 'number' ? focal35 : focal;

  // Portrait: longer focal length and/or shallow depth of field, often vertical.
  if (
    (typeof effectiveFocal === 'number' && effectiveFocal >= 70) ||
    (portraitOrientation && typeof effectiveFocal === 'number' && effectiveFocal >= 50) ||
    (typeof fNumber === 'number' && fNumber > 0 && fNumber <= 2.8 && portraitOrientation)
  ) {
    return 'Portrait';
  }

  // Nature: ultra-wide landscapes or telephoto wildlife.
  if (
    (typeof effectiveFocal === 'number' && effectiveFocal <= 24) ||
    (typeof effectiveFocal === 'number' && effectiveFocal >= 200)
  ) {
    return 'Nature';
  }

  // Event: often higher ISO and/or flash.
  if ((typeof iso === 'number' && iso >= 1600) || exif?.flashFired) {
    return 'Event';
  }

  // Street: default for mid focal lengths.
  if (typeof effectiveFocal === 'number' && effectiveFocal >= 24 && effectiveFocal <= 70) {
    return 'Street';
  }

  return 'Other';
}
