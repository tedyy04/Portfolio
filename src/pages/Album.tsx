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
    const cover = pickAlbumCover(resolvedAlbum);

    return (
      <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
        <div className="sticky top-40 z-40 mb-6">
          <Link
            to="/album"
            className="glass-chip font-body text-[10px] tracking-[0.2em] uppercase gap-2 liquid-hover liquid-focus hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All albums
          </Link>
        </div>

        <Reveal className="mb-10">
          <section className="relative overflow-hidden rounded-xl glass-frame">
            <div className="w-full h-[220px] md:h-[320px] lg:h-[380px]">
              {cover ? (
                <img
                  src={cover.src}
                  alt={cover.alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-low" />
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <h1 className="lovable-h2 text-charcoal">
                {resolvedAlbum.title}
              </h1>
              {resolvedAlbum.description ? (
                <p className="mt-3 text-on-surface-variant font-body text-[15px] leading-[1.6] max-w-[55ch]">
                  {resolvedAlbum.description}
                </p>
              ) : null}
            </div>
          </section>
        </Reveal>

        <AlbumGrid items={resolvedAlbum.items} />
      </main>
    );
  }

  return (
    <main className="pt-40 pb-24 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
      <Reveal className="mb-10">
        <p className="label-caps mb-4">Albums</p>
        <h1 className="lovable-h2 text-charcoal">
          Featured collections
        </h1>
        <p className="mt-4 text-on-surface-variant font-body text-[16px] leading-[1.6] max-w-[52ch]">
          Visual stories told through the lens.
        </p>
      </Reveal>

      {albums.length === 0 ? (
        <Reveal className="max-w-2xl">
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            No albums yet. Create <span className="text-on-surface">public/albums</span> and add a folder with images.
          </p>
        </Reveal>
      ) : (
        <section>
          {/* First album — full-width hero treatment */}
          {albums.slice(0, 1).map((album) => {
            const cover = pickAlbumCover(album);
            const photoCount = album.items.length;
            return (
              <Reveal key={album.slug} className="mb-5">
                <Link
                  to={`/album/${encodeSlugPath(album.slug)}`}
                  aria-label={`Open album ${album.title}`}
                  className="group relative block overflow-hidden rounded-xl glass-frame liquid-hover image-frame-hover"
                >
                  <div className="w-full aspect-[16/7]">
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
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between gap-4">
                    <span className="glass-chip">{album.title}</span>
                    <span className="glass-chip">{photoCount} photos</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}

          {/* Remaining albums — 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {albums.slice(1).map((album, index) => {
              const cover = pickAlbumCover(album);
              const photoCount = album.items.length;

              return (
                <Reveal
                  key={album.slug}
                  className="group relative overflow-hidden rounded-xl glass-frame liquid-hover image-frame-hover transition-all duration-500"
                  delayMs={(index % 6) * 55}
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
                        <span className="glass-chip">{album.title}</span>
                        <span className="glass-chip">{photoCount} photos</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
