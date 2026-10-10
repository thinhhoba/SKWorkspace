# Báo cáo nghiệm thu — Worker 4 (Văn thư, Hồ sơ pháp lý & Hợp đồng B2B /docs)

**Ngày:** 10/10/2026 | **Worker:** 4 — Legal & Document Archive Squad | **Route:** `/docs`

## 1. Phạm vi bàn giao

### Module nghiệp vụ `packages/modules/docs/`
- `types.ts` — `DocCategory` (legal | cert | contract_template), `DocFileType` (pdf/docx/xlsx), `DocRecord`, `CompanyLegalProfile`, `DocStats`, các map label/color và `DOC_CATEGORY_TAB`.
- `mockData.ts` — `COMPANY_LEGAL_PROFILE` (MST 0111252725, vốn 2 tỷ, trụ sở Thôn 6 Yên Xuân, ĐĐKD 00001 — 96 Ngõ 337 Định Công, NĐD Hồ Bá Thịnh, Thuế cơ sở 22, kế toán Trần Thị Lệ Quyên, Techcombank 22226060) + `MOCK_DOCS` 14 tài liệu:
  - Pháp lý doanh nghiệp 5 tài liệu khớp 5 PDF trong `docs/legal/` (01→05, ngày 16/10/2025 → 02/10/2026, cơ quan Sở Tài chính HN / Thuế cơ sở 22).
  - Chứng nhận ATTP & Kiểm dịch 4 tài liệu (GCN VSATTP kho lạnh, kiểm dịch lô C.P./VISSAN, cam kết VSATTP San Hà).
  - Hợp đồng B2B & Biểu mẫu 5 tài liệu (HĐNT bán lẻ/bán buôn, BB giao nhận chành xe, ủy quyền giao dịch, phụ lục báo giá).
- `docService.ts` — `getDocs({category,search})`, `getDocById`, `getDocStats()`, `__resetDocStore()`; filter theo category/search (title/code/file_name/issuer/tags).

### API `app/api/docs/route.ts`
- `GET /api/docs?category=ALL|legal|cert|contract_template&search=` → `{ success, stats, count, docs }`; dùng `getDocs` + `getDocStats`.

### Giao diện `app/(shell)/docs/page.tsx`
- Header + nút “Hồ sơ pháp lý” mở Drawer.
- **4 Clay-KPI:** Hồ sơ pháp lý (5), Chứng nhận VSATTP & Kiểm dịch (4), Hợp đồng B2B (5), Tổng dung lượng (~3.5 MB / 14 tệp) — data từ `GET /api/docs`.
- **Tabs:** Tất cả | Pháp lý doanh nghiệp | Chứng nhận ATTP & Kiểm dịch | Hợp đồng B2B & Biểu mẫu (lọc qua query `category`).
- **Search** debounce 300ms (tên/mã/file/issuer/tags).
- **Lưới danh thiếp** 3 cột: badge category, badge file type (pdf/docx/xlsx), icon, tên, file_name, issuer, issue_date, size, code, description, tags, nút Xem chi tiết/Tải về.
- **Dialog chi tiết** + **Drawer hồ sơ pháp lý Sơn Khang** (thông tin doanh nghiệp, NĐD, thuế & ngân hàng, danh mục 5 PDF).
- Style: Claymorphism/Glossy theo `app/globals.css`, tuân thủ pattern `app/(shell)/purchase/page.tsx`.

## 2. Tuân thủ chỉ thị
- Chỉ tạo/sửa trong `packages/modules/docs/**`, `app/api/docs/**`, `app/(shell)/docs/**` — không chạm thư mục worker khác.
- Không chạy `git commit`/`git push`.

## 3. Kiểm tra chất lượng
- `npx tsc --noEmit` — **0 lỗi**.

## 4. Tồn đọng / Gợi ý
- Chưa có upload thực tế (MinIO) — mock `storage_path` sẵn sàng nối MinIO/S3.
- Nút “Tải về” hiện mở dialog (chưa stream file) — khi có MinIO sẽ trả presigned URL.
- Có thể bổ sung API `GET /api/docs/[id]` nếu cần xem/tải từng tài liệu riêng.
