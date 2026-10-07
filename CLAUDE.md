# CLAUDE.md — SK Workspace

## Dự án
- **Tên:** SK Workspace — Platform mini-app nội bộ cho Cty TNHH Thực Phẩm Sơn Khang
- **Giám đốc:** Hồ Bá Thịnh | Quy mô: <30 nhân sự | VPS sẵn có | Web + PWA
- **Thư mục:** `Z:\SK Workspace 2`
- **Mục tiêu:** Platform với 6 phân hệ (nhân sự, mua hàng, bán hàng, dòng tiền, kho, văn thư) + tích hợp Sapo/Misa/meInvoice/HĐĐT/TCT/tra cứu MST/VietQR. Chạy song song với Sapo rồi thay thế dần.

## Tech Stack
Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + next-pwa | PostgreSQL + Prisma | BullMQ + Redis | MinIO | Auth.js + RBAC | Docker Compose + Nginx + Let's Encrypt

## Kiến trúc
Modular Monolith + Mini-App Shell. `packages/core`, `packages/integrations/<provider>`, `packages/modules/*`. Adapter pattern cho integrations (`sync/push/pull/webhook`), `external_id + last_synced_at`, `integration_logs`.

## Quy trình 4 Agents

| Agent | Model | Vai trò |
|-------|-------|---------|
| **Plan** | Opus 5.5 (`plan`) | Phân tích, thiết kế, chia task → plan file |
| **Code** | Sonnet 5.5 (`code`) | Viết code theo plan |
| **Test** | Haiku 4.5 (`test`) | Viết & chạy test |
| **Review** | Opus 5.5 (`review`) | Review correctness/bảo mật/hiệu năng |

Handoff: Plan → (duyệt) → Code → Test → Review → Done. Quay lại Code/Test nếu Review request_changes.

## Multi-agent song song
Tách song song khi các task không phụ thuộc (không cùng file, không cùng migrate). Dùng **Workflow** tool khi task lớn hoặc user ghi `ultracode`. Workflow size guideline: `medium` (<10 agents).

Gọi agent: `Agent(subagent_type="plan"|"code"|"test"|"review", prompt="...")`
Workflow: `Workflow(script="export const meta={...} ...")`

## Quy ước
- Plan file: `C:/Users/hobat/.claude/plans/<ten>.md` (global) hoặc `.claude/plans/` (project)
- Commit attribution: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- PR attribution: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
- Ngôn ngữ: trả lời user bằng tiếng Việt.
