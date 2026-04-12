# Workflow thêm ảnh mới (preprocessing → portfolio)

Mục tiêu: thêm ảnh mới vào project theo chuẩn tên file `ted_###`, trích EXIF, điền metadata (label/alt/category/tags/…) theo kiểu **điền thiếu (fill missing)**, rồi tự phân loại ảnh vào từng category folder.

## 1) Import ảnh mới

- Copy ảnh mới vào thư mục: `preprocessing/`

## 2) Đổi tên ảnh theo format `ted_###`

Chạy:

```bash
npm run pre:rename
```

- Script sẽ **resize + convert về `.jpeg` + rename** ảnh trong `preprocessing/`.
- Nó tránh trùng số `ted_###` với ảnh đang có trong `public/images/**`.

Mặc định:

- `MAX_DIM=2400`
- `JPEG_QUALITY=82`

Bạn có thể override khi cần:

```bash
MAX_DIM=3000 JPEG_QUALITY=86 npm run pre:rename
```

## (Tuỳ chọn) Giảm size ảnh đã có trong `public/images/**`

Nếu hiện tại web đang lag vì ảnh quá nặng, bạn có thể chạy 1 lần để shrink ảnh đang có:

```bash
npm run img:shrink
```

Lưu ý: lệnh này **chỉnh file in-place** trong `public/images/**`. Nếu bạn cần giữ bản gốc full-res, hãy backup trước khi chạy.

## 3) Trích EXIF + tạo file metadata để bạn điền

Chạy:

```bash
npm run pre:meta
```

Nó sẽ tạo/cập nhật file:

- `scripts/preprocessing.metadata.json`

Trong mỗi entry (mỗi ảnh) sẽ có:

- `exifExtracted`: EXIF trích từ ảnh (các key phổ biến luôn có sẵn: `camera`, `lens`, `aperture`, `shutterSpeed`, `iso`, …)
- `exifFound`: `true/false` để biết ảnh có EXIF thật hay không
- `overrideSnapshot`: snapshot data hiện đang có trong `scripts/portfolio.overrides.json` (nếu ảnh đó đã có entry)
- `draft`: **phần bạn sẽ edit**

### Bạn cần edit phần nào?

Ưu tiên edit trong:

- `draft.label`
- `draft.alt`
- `draft.category`
- `draft.tags`
- `draft.hideOnHome`
- `draft.exif`

Ghi chú:

- Lệnh `npm run pre:apply` sẽ **ưu tiên** `draft.*`.
- Nếu `draft.label/alt` đang trống thì nó sẽ fallback dùng `suggested.label/alt` để fill vào overrides.
- Nếu `draft.exif` trống thì nó sẽ fallback dùng `exifExtracted` để fill vào overrides.

Tip: `npm run pre:meta` có thể chạy lại nhiều lần mà vẫn giữ nguyên phần `draft` bạn đã điền.

## 4) Apply metadata vào overrides (CHỈ điền thiếu, không ghi đè)

Chạy:

```bash
npm run pre:apply
```

Script sẽ update:

- `scripts/portfolio.overrides.json`

Nguyên tắc:

- **Không ghi đè** các field đã có sẵn trong overrides.
- Chỉ **fill** các field đang thiếu/rỗng.
- `exif` sẽ merge theo từng field (field nào thiếu mới điền).

## 5) Phân loại ảnh vào category folder (làm thủ công)

Sau khi metadata ổn, bạn tự move ảnh từ `preprocessing/` sang:

- `public/images/<category>/ted_###.jpeg`

Ví dụ:

- `public/images/scene/ted_451.jpeg`
- `public/images/event/ted_999.jpeg`

Generator sẽ:

- Lấy `src` đúng theo đường dẫn folder bạn đặt (`/images/<category>/...`).
- Nếu overrides chưa set `category`, nó có thể suy ra category theo tên folder.

## 6) Regenerate data + chạy app

Regenerate data (generate `src/data/portfolioItems.generated.ts`):

```bash
npm run regen
```

Chạy dev:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

---

## Cheatsheet nhanh

```bash
# 1) rename ảnh trong preprocessing/
npm run pre:rename

# 2) trích EXIF + tạo file để điền metadata
npm run pre:meta

# 3) apply metadata (fill thiếu) vào overrides
npm run pre:apply

# 4) (tự tay) move ảnh sang public/images/<category>/...

# 5) regen + dev/build
npm run regen
npm run dev
npm run build
```
