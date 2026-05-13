# Albums

Put album photos under this folder.

## Structure

- Each folder that contains images becomes an album.
- Nested folders become nested albums (sub-albums).

Examples:

```
public/albums/
  Graduation/
    img_01.jpg
    img_02.jpg
  Graduation/An/
    an_01.jpg
    an_02.jpg
  Street Night/
    s01.webp
```

## URLs

- Album list: `/album`
- Album page: `/album/<folder>/<subfolder>`
  - Example: `public/albums/Graduation/An` → `/album/Graduation/An`

## Notes

- Supported image extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`.
- The app generates album data during `npm run dev` and `npm run build`.

## Picking a thumbnail (cover)

To manually choose an album thumbnail, edit `scripts/portfolio.overrides.json` and mark one image with `isCover: true` under the `albums` key.

Keys are the image path relative to `public/albums`.

Example:

```json
{
  "albums": {
    "Graduation/An/an_01.jpg": {
      "isCover": true
    }
  }
}
```
