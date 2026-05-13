import {
	albums as generatedAlbumList,
	type Album as GeneratedAlbum,
	type AlbumItem,
} from './albums.generated';
import { albumMetaBySlug } from './albums.manual';

export type Album = GeneratedAlbum & {
	description?: string;
};

export type { AlbumItem };

export const albums: Album[] = generatedAlbumList.map((album) => {
	const meta = albumMetaBySlug[album.slug];
	return {
		...album,
		description: meta?.description,
	};
});

export default albums;
