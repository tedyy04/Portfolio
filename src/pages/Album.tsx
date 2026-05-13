import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal';
import AlbumGrid from '../components/AlbumGrid';
import { albums, type Album } from '../data/albums';

function encodeSlugPath(slug: string) {
  return slug
    .split('/')
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join('/');
}

function pickAlbumCover(album: Album) {
  const items = album.items;
  if (!items.length) return undefined;
  return (
    items.find((i) => i.isCover) ??
    items.find((i) => /^_?cover\./i.test(i.fileName)) ??
    items.find((i) => /^(00|01)[-_ ]?cover\./i.test(i.fileName)) ??
    items[0]
  );
}

export default function Album() {
  const params = useParams();
  const rawAlbum = (params['*'] ?? '').trim();

  const resolvedAlbum = useMemo(() => {
    if (!rawAlbum) return null;
    const key = rawAlbum.replace(/^\/+/, '').replace(/\/+$/, '');
    return albums.find((a) => a.slug === key) ?? null;
  }, [rawAlbum]);

  if (rawAlbum && !resolvedAlbum) {
    return (
      <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
        <Reveal className="max-w-2xl">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-primary">
            Album not found
          </h1>
          <p className="mt-4 text-on-surface-variant font-body text-sm leading-relaxed">
            This album doesn’t exist (yet).
          </p>
          <div className="mt-8">
            <Link
              to="/album"
              className="inline-flex items-center gap-3 text-primary group"
            >
              <span className="font-body text-[10px] tracking-[0.2em] uppercase border-b border-transparent group-hover:border-primary transition-all pb-1">
                Back to Albums
              </span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </Reveal>
      </main>
    );
  }

  if (resolvedAlbum) {
    return (
      <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
        <Reveal className="mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-primary">
              {resolvedAlbum.title}
            </h1>
            <p className="text-on-surface-variant font-body text-sm tracking-wide">
              {resolvedAlbum.items.length} photos
            </p>
          </div>

          <div className="mt-6">
            <Link
              to="/album"
              className="inline-flex items-center gap-3 text-primary group"
            >
              <span className="font-body text-[10px] tracking-[0.2em] uppercase border-b border-transparent group-hover:border-primary transition-all pb-1">
                All albums
              </span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </Reveal>

        <AlbumGrid items={resolvedAlbum.items} />
      </main>
    );
  }

  return (
    <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
      <Reveal className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-primary">
          Albums
        </h1>
        <p className="mt-4 text-on-surface-variant font-body text-sm leading-relaxed max-w-2xl">
          Manually curated collections.
        </p>
      </Reveal>

      {albums.length === 0 ? (
        <Reveal className="max-w-2xl">
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            No albums yet. Create <span className="text-on-surface">public/albums</span> and add a folder with images.
          </p>
        </Reveal>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {albums.map((album, index) => {
            const cover = pickAlbumCover(album);
            const photoCount = album.items.length;

            return (
              <Reveal
                key={album.slug}
                className="group relative overflow-hidden rounded-2xl glass-frame liquid-hover image-frame-hover transition-all duration-500"
                delayMs={(index % 9) * 45}
              >
                <Link
                  to={`/album/${encodeSlugPath(album.slug)}`}
                  className="block"
                  aria-label={`Open album ${album.title}`}
                >
                  <div className="w-full aspect-[16/10]">
                    {cover ? (
                      <img
                        src={cover.src}
                        alt={cover.alt}
                        className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-low" />
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-end justify-between gap-3">
                      <span className="glass-chip font-label text-[9px] tracking-[0.2em] uppercase">
                        {album.title}
                      </span>
                      <span className="glass-chip font-label text-[9px] tracking-[0.2em] uppercase">
                        {photoCount} photos
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </section>
      )}
    </main>
  );
}
