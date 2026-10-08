export const meta = {
  name: "sk-phase",
  description: "Triển khai 1 phase SK Workspace qua pipeline 4 agents (Plan→Code→Test→Review) với multi-agent song song",
  phases: [
    { title: "Plan", detail: "Opus lập plan chi tiết cho phase" },
    { title: "Code", detail: "Sonnet agents code song song các module" },
    { title: "Test", detail: "Haiku agents test song song" },
    { title: "Review", detail: "Sonnet review toàn bộ" },
  ],
};

// Usage: Workflow(name="sk-phase", args={ phase: "Giai đoạn 1 — Platform Core", modules: ["shell","integrations","pwa"] })
// args.phase   — tên phase (string)
// args.modules — danh sách module song song (string[]). Nếu không có, Code/Test chạy 1 agent.

const phase = args?.phase ?? "SK Workspace Phase";
const modules = args?.modules ?? ["default"];

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
    `Bạn là Review Agent. Review toàn bộ diff + test results cho phase "${phase}" ở mức high. ` +
    `Đọc plan để hiểu yêu cầu gốc, kiểm tra correctness/bảo mật/hiệu năng/đơn giản hóa. ` +
    `Liệt kê findings với file:line + severity, kết luận approve hoặc request_changes. ` +
    `Ghi toàn bộ báo cáo nghiệm thu vào .claude/reports/latest.md.`,
    { label: "review", phase: "Review" }
  );
});

return { phase, modules, codeResults };
