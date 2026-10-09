# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH: THIẾT LẬP HỆ THỐNG DEPLOY VPS TỰ ĐỘNG QUA GITHUB (CÁCH 2: GITHUB ACTIONS + GHCR)
# DỰ ÁN: SK WORKSPACE — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CĂN CỨ PHÊ DUYỆT: Quyết định Chủ tịch ngày 08/10/2026 — Phê duyệt triển khai theo Mô hình Cách 2

Chủ tịch và Commander đã **CHÍNH THỨC PHÊ DUYỆT MÔ HÌNH DEPLOY CÁCH 2**:
Thiết lập toàn bộ cơ chế triển khai tự động lên VPS thông qua **GitHub Actions CI/CD kết hợp GitHub Container Registry (GHCR)**. Build Docker image siêu nhẹ trên hạ tầng mây của GitHub, sau đó đẩy sang VPS kéo về chạy trong 5-10 giây, bảo đảm VPS không bị chiếm dụng CPU/RAM và duy trì hệ thống liên tục (*Zero-Downtime*).

Kích hoạt **Agent Code (Model: Claude Sonnet 5.5)** triển khai trọn gói bộ tệp tin triển khai sau:

---

### 1. CẤU HÌNH NEXT.JS STANDALONE (`next.config.mjs`):
- Thêm cấu hình `output: "standalone"` vào `nextConfig` để Next.js 15 tự động đóng gói toàn bộ server chạy độc lập không phụ thuộc thư mục `node_modules` nặng nề.

---

### 2. DOCKERFILE MULTI-STAGE TỐI ƯU SIÊU NHẸ (`Dockerfile`):
- Sử dụng `node:20-alpine` làm base.
- Xây dựng 3 stages:
  1. `deps`: Cài đặt dependencies với `npm ci`.
  2. `builder`: Build Next.js (`npm run build`).
  3. `runner`: Chỉ copy `.next/standalone`, `.next/static` và thư mục `public/`.
- Dung lượng image thành phẩm `< 150MB`, khởi động container cực nhanh (~2 giây).

---

### 3. DOCKER COMPOSE TRỌN GÓI 1 VPS (`docker-compose.yml`):
- **`app`**: Chạy image từ GHCR (hoặc fallback build local), port nội bộ `3000:3000`, tự khởi động lại `restart: always`.
- **`postgres`**: PostgreSQL 16 Alpine, volume gắn ngoài `postgres_data`, bảo vệ mật khẩu qua `.env`.
- **`redis`**: Redis 7 Alpine phục vụ hàng đợi xử lý ngầm (BullMQ) kéo đơn từ Sapo và đẩy sang MISA.
- **`nginx`**: Cổng ngoài `80:80` và `443:443`, bọc reverse proxy, kết nối thư mục cấu hình `./nginx` và chứng chỉ SSL Let's Encrypt.

---

### 4. CẤU HÌNH NGINX REVERSE PROXY CHUẨN PWA (`nginx/nginx.conf`):
- Tối ưu hóa nén `gzip` và `brotli`.
- **Chống lỗi Excel Kế toán:** Cấu hình `client_max_body_size 50M;` để upload file bảng kê 63 cột MISA dung lượng lớn mượt mà.
- **Tối ưu Cache PWA:**
  - File `/sw.js` và `manifest.json`: Header `Cache-Control "no-cache, no-store, must-revalidate";` (để điện thoại nhân viên luôn tự động cập nhật app mới nhất).
  - Thư mục `/_next/static/`: Header `Cache-Control "public, max-age=31536000, immutable";` (tăng tốc độ tải trang tức thì).
- Cấu hình proxy_pass sang `http://app:3000`.

---

### 5. WORKFLOW GITHUB ACTIONS CI/CD (`.github/workflows/deploy.yml`):
- Kích hoạt tự động mỗi khi có commit đẩy lên nhánh `main` hoặc `master`.
- **Job 1 (Test & Build):**
  - Chạy `npx tsc --noEmit` kiểm tra type.
  - Đăng nhập vào GitHub Container Registry (`ghcr.io`).
  - Build Docker image bằng Docker Buildx và đẩy lên `ghcr.io/${{ github.repository }}:latest`.
- **Job 2 (Deploy sang VPS):**
  - Kết nối SSH vào VPS qua `appleboy/ssh-action` sử dụng các biến Secrets (`VPS_HOST`, `VPS_SSH_KEY`, `VPS_USER`).
  - Chạy các lệnh tự động trên VPS:
    ```bash
    cd /opt/sk-workspace
    docker compose pull app
    docker compose up -d --remove-orphans
    docker system prune -f
    ```

---

### 6. CÁC TỆP TIỆN ÍCH HỖ TRỢ:
- `.env.production.example`: Mẫu các biến môi trường cấu hình cho server production.
- `scripts/setup-vps.sh`: Script cài đặt 1 chạm cho VPS mới (cài Docker, Docker Compose, tạo thư mục `/opt/sk-workspace`, mở tường lửa UFW 80/443).
- Cập nhật `.gitignore` để không commit các file nhạy cảm (`.env.production`, chứng chỉ ssl, dữ liệu postgres).

---

### 7. QUY TẮC KIỂM THỬ:
- Chạy `npx tsc --noEmit` và `npm run build` kiểm tra tính tương thích `output: 'standalone'`.
- Cập nhật báo cáo nghiệm thu vào `.claude/reports/latest.md`.
