export const meta = {
  name: "sk-phase",
  description: "Triển khai 1 phase SK Workspace qua pipeline 4 agents với Dual-Track Review (Standard Sonnet / Critical Opus)",
  phases: [
    { title: "Plan", detail: "Opus lập plan chi tiết cho phase" },
    { title: "Code", detail: "Sonnet agents code song song các module" },
    { title: "Test", detail: "Haiku agents test song song" },
    { title: "Review", detail: "Sonnet (Standard) / Opus 5.5 (Critical: finance, database, security, packages/core)" },
  ],
};

// Usage: Workflow(name="sk-phase", args={ phase: "Giai đoạn 1", modules: ["shell","finance"], critical: true })
// args.phase    — tên phase (string)
// args.modules  — danh sách module song song (string[])
// args.critical — đánh dấu nhánh trọng yếu (boolean). Tự động kích hoạt nếu modules chứa finance/database/security/core.

const phase = args?.phase ?? "SK Workspace Phase";
const modules = args?.modules ?? ["default"];
const isCritical = Boolean(
  args?.critical ||
  modules.some((m) => ["finance", "database", "security", "core", "sapo2misa", "ledger"].includes(String(m).toLowerCase()))
);
const reviewModel = isCritical ? "claude-opus-5-5" : "claude-sonnet-5-5";

await phase("Plan", async () => {
  await agent(
    `Bạn là Plan Agent. Lập plan chi tiết cho "${phase}" của SK Workspace. ` +
    `Đọc CLAUDE.md và plan tổng t-i-l-gi-m-c-zippy-pebble.md. ` +
    `Thiết kế: schema DB, file cần tạo/sửa, thứ tự triển khai, chỗ nào song song được, rủi ro, verification. ` +
    `Ghi plan vào C:/Users/hobat/.claude/plans/<ten-phase>.md`,
    { label: "plan", phase: "Plan" }
  );
});

const codeResults = await phase("Code", async () => {
  return await parallel(
    modules.map((m) => () =>
      agent(
        `Bạn là Code Agent. Triển khai module "${m}" cho phase "${phase}" theo plan đã duyệt. ` +
        `Đọc plan file và CLAUDE.md trước khi code. Tuân thủ tech stack Next.js+Prisma. ` +
        `Chạy build check trước khi bàn giao.`,
        { label: `code:${m}`, phase: "Code" }
      )
    )
  );
});

await phase("Test", async () => {
  await parallel(
    modules.map((m) => () =>
      agent(
        `Bạn là Test Agent. Viết và chạy test cho module "${m}" phase "${phase}". ` +
        `Đọc code mới, viết Vitest tests, chạy npm test + tsc --noEmit, báo pass/fail.`,
        { label: `test:${m}`, phase: "Test" }
      )
    )
  );
});

await phase("Review", async () => {
  await agent(
    `Bạn là Review Agent (${isCritical ? "🚨 CRITICAL MODE — Opus 5.5" : "⚙️ STANDARD MODE — Sonnet 5.5"}). ` +
    `Review toàn bộ diff + test results cho phase "${phase}" ở mức high. ` +
    `Đọc plan để hiểu yêu cầu gốc, kiểm tra correctness/bảo mật/hiệu năng/đơn giản hóa. ` +
    (isCritical ? `CHÚ Ý ĐẶC BIỆT: Module thuộc nhánh TRỌNG YẾU (finance/database/security/packages/core). Thẩm định tính toán tiền tệ, an toàn dữ liệu và phân quyền trước khi xin lệnh duyệt. ` : "") +
    `Liệt kê findings với file:line + severity, kết luận approve hoặc request_changes. ` +
    `Ghi toàn bộ báo cáo nghiệm thu vào .claude/reports/latest.md.`,
    { label: "review", phase: "Review", model: reviewModel }
  );
});

return { phase, modules, codeResults };
