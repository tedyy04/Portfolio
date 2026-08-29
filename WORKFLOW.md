# Workflow thêm ảnh mới (preprocessing → portfolio)

Quy trình tinh gọn để thêm ảnh mới vào portfolio: tự động đổi tên `ted_###`, tối ưu kích thước, trích xuất EXIF, điền metadata và tự động phân loại vào thư mục category.

---

## 1. Thêm ảnh thô
- Sao chép các file ảnh mới vào thư mục: `preprocessing/`

---

## 2. Đổi tên & Chuẩn hoá kích thước
Chạy lệnh:
```bash
npm run pre:rename
```
- Tự động **resize + nén sang `.jpeg` + đổi tên** thành định dạng chuẩn `ted_###.jpeg`.
- Tự dò số ngẫu nhiên không trùng với các ảnh đã có trong hệ thống (`public/images/**`).
- Mặc định: `MAX_DIM=2400`, `JPEG_QUALITY=82`. Có thể tuỳ chỉnh nếu cần:
  ```bash
  MAX_DIM=3000 JPEG_QUALITY=86 npm run pre:rename
  ```

---

## 3. Trích xuất EXIF & Tạo Metadata gợi ý
Chạy lệnh:
```bash
npm run pre:meta
```
- Tự động đọc thông số EXIF trực tiếp từ ảnh (máy ảnh, ống kính, khẩu độ, tốc độ, ISO, tiêu cự, kích thước).
- Tạo hoặc cập nhật file: `scripts/preprocessing.metadata.json` với cấu trúc phẳng duy nhất:

```json
{
  "ted_101.jpeg": {
    "category": "Street",
    "label": "TED 101",
    "alt": "Portfolio image TED 101",
    "tags": "",
    "hideOnHome": false,
    "exif": {
      "camera": "Sony A7 IV",
      "lens": "FE 35mm F1.4 GM",
      "aperture": "f/1.4",
      "shutterSpeed": "1/500",
      "iso": 100,
      "focalLengthMm": 35,
      "width": 2400,
      "height": 1600
    }
  }
}
```

### Bạn cần chỉnh sửa gì trong file này?
1. **`category`** *(quan trọng)*: Điền tên thể loại (ví dụ: `Street`, `Scene`, `Event`, `Concept`).
2. **`label` & `alt`**: Đặt tên ảnh và mô tả nghệ thuật hiển thị trên web & lightbox.
3. **`tags`**: Gắn tag phụ trợ nếu có (ví dụ: `"Night, Tokyo"` hoặc `["Night", "Tokyo"]`).
4. **`hideOnHome`**: Đặt `true` nếu không muốn ảnh xuất hiện trên trang chủ Gallery.
5. **`exif`**: Có thể sửa hoặc thêm các thông số nếu máy cơ / ảnh film không có EXIF số sẵn.

*(Ghi chú: Lệnh `npm run pre:meta` có thể chạy lại nhiều lần mà vẫn giữ nguyên các giá trị bạn đã sửa).*

---

## 4. Áp dụng Metadata & Tự động Phân loại
Chạy lệnh:
```bash
npm run pre:apply
```

Lệnh này sẽ tự động:
1. **Ghi nhận vào Overrides**: Lưu thông tin vào `scripts/portfolio.overrides.json` theo cơ chế *fill-missing* (chỉ điền các trường còn thiếu, không ghi đè dữ liệu bạn đã lưu trước đó).
2. **Tự động di chuyển file ảnh**: Tự động chuyển file ảnh từ `preprocessing/<fileName>` vào đúng thư mục phân loại `public/images/<category>/` (ví dụ: `public/images/street/ted_101.jpeg`).
3. **Tự động cập nhật dữ liệu web**: Tự động chạy tạo lại `src/data/portfolioItems.generated.ts` và `src/data/albums.generated.ts`.
4. **Dọn dẹp**: Tự động làm sạch `scripts/preprocessing.metadata.json` sau khi hoàn tất. *(Nếu muốn giữ lại file metadata để xem, thêm cờ: `npm run pre:apply -- --keep-metadata`)*.

---

## Cheatsheet Tóm tắt

```bash
# 1) Đổi tên và tối ưu size ảnh
npm run pre:rename

# 2) Trích xuất EXIF và tạo bản metadata gợi ý
npm run pre:meta

# 3) Mở scripts/preprocessing.metadata.json điền category, chỉnh label/alt/tags

# 4) Apply vào overrides, tự động move ảnh vào public/images/<category>/ và regen data
npm run pre:apply

# 5) Chạy thử nghiệm web
npm run dev
```

---

# Deploy / Publish (Vercel + GitHub)

Mỗi lần bạn `git push` lên branch deploy, Vercel sẽ tự động build và cập nhật phiên bản mới nhất.

### Cấu hình Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Lệnh Deploy nhanh:
```bash
git add .
git commit -m "Update portfolio images and metadata"
git push origin HEAD:feature-cinematic-portfolio-6560193385071199878
```
