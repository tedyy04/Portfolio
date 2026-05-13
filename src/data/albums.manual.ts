export interface AlbumDefinition {
  /** Used in the URL: /album/:slug */
  slug: string;
  /** Display title */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Optional cover photo fileName; falls back to first item */
  coverFileName?: string;
  /** Ordered list of photo fileNames (from PortfolioItem.fileName) */
  fileNames: string[];
}

/**
 * Manual-curated albums (kept for reference).
 *
 * The active album system uses folder-driven generation from `public/albums`.
 */
export const albums: AlbumDefinition[] = [];
