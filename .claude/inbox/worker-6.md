# PHÂN CÔNG THỰC THI — WORKER 6 (HRM & TASK FLOW SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 6. NHÂN SỰ & QUẢN TRỊ CÔNG VIỆC (HRM & TASK FLOW)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/modules/hr/**`
- `packages/modules/tasks/**`
- `app/(shell)/hr/**`
- `app/(shell)/tasks/**`
- `app/(shell)/feed/**`
- `app/(shell)/chat/**`
- `app/api/hr/**`
- `app/api/tasks/**`
- `app/api/feed/**`
- Báo cáo kết quả: `.claude/reports/worker-6-hr.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Hồ sơ nhân sự:** Quản trị thông tin nhân viên, hợp đồng, 4 phòng ban (Văn phòng, Kho Định Công, Giao vận, Sales thị trường).
2. **Chấm công thông minh:** Chấm công wifi kho Định Công + Tự động ghi nhận ngày công Sales theo GPS check-in điểm bán.
3. **Tính lương & KPI tự động:**
   - Sales: Thưởng doanh số, thưởng sản lượng (số thùng mì Indomie, can sốt).
   - Đội xe: Phụ cấp chuyến, định mức xăng xe, thưởng đơn thành công & đối soát COD đúng hạn.
   - Bảng lương Payslip điện tử tự động.
4. **Quản trị Luồng công việc (Task Flow & Workflow):** Phê duyệt chứng từ (PO mua, vượt hạn mức nợ, duyệt chi), Kanban view, Gantt chart & SLA.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-6-hr.md`.
