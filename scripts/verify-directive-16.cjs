#!/usr/bin/env node
// scripts/verify-directive-16.cjs — Quality Gate cho Chỉ thị 16 : Smart Workdesk
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

let pass = 0, fail = 0;
function ok(name) { pass++; console.log(`  PASS  ${name}`); }
function ng(name, msg) { fail++; console.log(`  FAIL  ${name} — ${msg}`); }
function section(t) { console.log(`\n[ ${t} ]`); }
const ROOT = path.resolve(__dirname, "..");

// 1. tsc --noEmit
section("1. tsc --noEmit");
try {
  execSync("npx tsc --noEmit", { stdio: "pipe", timeout: 120000, cwd: ROOT });
  ok("tsc --noEmit — 0 errors");
} catch (e) {
  const out = (e.stdout || e.stderr || e.message || "").toString().slice(0, 2000);
  ng("tsc --noEmit", out.replace(/\n/g, " | ").slice(0, 800));
}

// 2. File existence — 18+ files workdesk/feed/tasks
section("2. File existence — workdesk/feed/tasks (18+ files)");
const requiredFiles = [
  "app/(shell)/page.tsx",
  "components/workdesk/WorkdeskShell.tsx",
  "components/workdesk/LeftColumn.tsx",
  "components/workdesk/CenterColumn.tsx",
  "components/workdesk/RightColumn.tsx",
  "components/workdesk/KpiCard.tsx",
  "components/workdesk/Launchpad.tsx",
  "components/workdesk/ChatMiniWidget.tsx",
  "components/workdesk/ScratchpadWidget.tsx",
  "components/workdesk/OnlineStaffWidget.tsx",
  "components/workdesk/FinanceWidget.tsx",
  "components/workdesk/TasksWidget.tsx",
  "components/workdesk/FleetRadarWidget.tsx",
  "components/workdesk/NewsfeedComposer.tsx",
  "components/workdesk/FeedCard.tsx",
  "components/workdesk/CommentThread.tsx",
  "packages/modules/feed/feedService.ts",
  "packages/modules/feed/types.ts",
  "packages/modules/feed/index.ts",
  "packages/modules/feed/mockData.ts",
  "packages/modules/tasks/tasksService.ts",
  "packages/modules/tasks/types.ts",
  "packages/modules/tasks/index.ts",
  "packages/modules/fleet/telemetryService.ts",
  "app/api/feed/stream/route.ts",
  "app/api/feed/posts/route.ts",
  "app/api/feed/posts/[id]/like/route.ts",
  "app/api/feed/posts/[id]/pin/route.ts",
  "app/api/feed/posts/[id]/comments/route.ts",
  "app/api/tasks/route.ts",
  "app/api/tasks/[id]/route.ts",
  "app/api/fleet/telemetry/route.ts",
  "prisma/schema.prisma",
];
let missing = [];
for (const rel of requiredFiles) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) ok(rel);
  else { ng(rel, "missing"); missing.push(rel); }
}
if (missing.length === 0) ok(`All ${requiredFiles.length} required files present`);
else ng(`File existence summary`, `${missing.length} missing / ${requiredFiles.length} total`);

// Also check workdesk file count >=15
try {
  const wdDir = path.join(ROOT, "components/workdesk");
  const files = fs.readdirSync(wdDir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
  if (files.length >= 15) ok(`workdesk file count ${files.length} >= 15`);
  else ng("workdesk file count", `only ${files.length} files: ${files.join(", ")}`);
} catch (e) { ng("workdesk file count", e.message); }

// 3. Feed service — createPost, toggleLike, togglePin, addComment, getStream (pinned first)
section("3. Feed service — createPost, toggleLike, togglePin, addComment, getStream");
try {
  require("tsx/cjs");
  const feed = require(path.join(ROOT, "packages/modules/feed/feedService.ts"));
  const { createPost, toggleLike, togglePin, addComment, getStream, getPosts, resetStore } = feed;
  if (typeof resetStore === "function") resetStore();

  // createPost
  const post = createPost({ content: "QA test post " + Date.now(), tag: "thong-bao" });
  if (post && post.id && post.content) ok("createPost creates post with id+content");
  else ng("createPost", "did not return valid post");

  // toggleLike
  const like1 = toggleLike(post.id, "qa-user-1");
  if (like1 && like1.liked === true && like1.likes === 1) ok("toggleLike first call liked=true likes=1");
  else ng("toggleLike first", JSON.stringify(like1));
  const like2 = toggleLike(post.id, "qa-user-1");
  if (like2 && like2.liked === false && like2.likes === 0) ok("toggleLike second call toggles off");
  else ng("toggleLike second", JSON.stringify(like2));
  const likeBad = toggleLike("nonexistent-id-xyz", "qa-user-1");
  if (likeBad === null) ok("toggleLike nonexistent returns null");
  else ng("toggleLike nonexistent", JSON.stringify(likeBad));

  // togglePin
  const pin1 = togglePin(post.id);
  if (pin1 && pin1.pinned === true) ok("togglePin pins post");
  else ng("togglePin pin", JSON.stringify(pin1));
  const pin2 = togglePin(post.id);
  if (pin2 && pin2.pinned === false) ok("togglePin unpins post");
  else ng("togglePin unpin", JSON.stringify(pin2));
  // repin for stream test
  togglePin(post.id);

  // addComment
  const comment = addComment(post.id, { content: "QA comment", author: "QA Tester" });
  if (comment && comment.id && comment.postId === post.id) ok("addComment creates comment");
  else ng("addComment", JSON.stringify(comment));
  const commentBad = addComment("nonexistent-id-xyz", { content: "x" });
  if (commentBad === null) ok("addComment nonexistent returns null");
  else ng("addComment nonexistent", JSON.stringify(commentBad));

  // getStream — pinned first
  const stream = getStream();
  if (Array.isArray(stream) && stream.length > 0) ok(`getStream returns ${stream.length} items`);
  else ng("getStream", "empty or not array");
  // verify pinned posts come first
  const pinnedIdx = stream.findIndex(s => s.kind === "post" && s.pinned);
  const unpinnedPostIdx = stream.findIndex(s => s.kind === "post" && !s.pinned);
  if (pinnedIdx !== -1 && unpinnedPostIdx !== -1) {
    if (pinnedIdx < unpinnedPostIdx) ok("getStream pinned posts first");
    else ng("getStream pinned first", `pinned at ${pinnedIdx}, unpinned at ${unpinnedPostIdx}`);
  } else if (pinnedIdx !== -1) {
    ok("getStream pinned posts first (only pinned posts present)");
  } else {
    ng("getStream pinned first", "no pinned post found in stream (expected at least 1 after togglePin)");
  }

  // getPosts sorted pinned first
  const posts = getPosts();
  if (posts[0] && posts[0].pinned) ok("getPosts pinned first");
  else ng("getPosts pinned first", `first post pinned=${posts[0]?.pinned}`);

  if (typeof resetStore === "function") resetStore();
} catch (e) {
  ng("feed service", (e.message || "").slice(0, 800) + "\n" + (e.stack || "").slice(0, 800));
}

// 4. Tasks service — createTask, toggleTaskStatus, getTasks
section("4. Tasks service — createTask, toggleTaskStatus, getTasks");
try {
  require("tsx/cjs");
  const tmod = require(path.join(ROOT, "packages/modules/tasks/tasksService.ts"));
  const { createTask, toggleTaskStatus, getTasks, getTaskById, __resetTasksStore } = tmod;
  if (typeof __resetTasksStore === "function") __resetTasksStore();

  const task = createTask({ title: "QA task " + Date.now(), priority: "cao", assignee: "QA" });
  if (task && task.id && task.title) ok("createTask creates task with id+title");
  else ng("createTask", JSON.stringify(task));

  // empty title should throw
  let threw = false;
  try { createTask({ title: "   " }); } catch { threw = true; }
  if (threw) ok("createTask empty title throws");
  else ng("createTask empty title", "should throw");

  // toggleTaskStatus
  const toggled = toggleTaskStatus(task.id);
  if (toggled && toggled.status === "hoan_thanh") ok("toggleTaskStatus -> hoan_thanh");
  else ng("toggleTaskStatus first", JSON.stringify(toggled));
  const toggled2 = toggleTaskStatus(task.id);
  if (toggled2 && toggled2.status === "cho_xu_ly") ok("toggleTaskStatus toggle back -> cho_xu_ly");
  else ng("toggleTaskStatus second", JSON.stringify(toggled2));
  const toggledBad = toggleTaskStatus("nonexistent-xyz");
  if (toggledBad === null) ok("toggleTaskStatus nonexistent returns null");
  else ng("toggleTaskStatus nonexistent", JSON.stringify(toggledBad));

  // getTasks
  const all = getTasks();
  if (Array.isArray(all) && all.length > 0) ok(`getTasks returns ${all.length} tasks`);
  else ng("getTasks", "empty or not array");
  const filtered = getTasks({ status: "hoan_thanh" });
  if (filtered.every(t => t.status === "hoan_thanh")) ok("getTasks filter by status works");
  else ng("getTasks filter", JSON.stringify(filtered.slice(0, 2)));

  // getTaskById
  const found = getTaskById(task.id);
  if (found && found.id === task.id) ok("getTaskById finds task");
  else ng("getTaskById", JSON.stringify(found));

  if (typeof __resetTasksStore === "function") __resetTasksStore();
} catch (e) {
  ng("tasks service", (e.message || "").slice(0, 800) + "\n" + (e.stack || "").slice(0, 800));
}

// 5. Feed API — GET /api/feed/stream returns items, POST /api/feed/posts creates
section("5. Feed API — GET /api/feed/stream & POST /api/feed/posts");
try {
  const streamSrc = fs.readFileSync(path.join(ROOT, "app/api/feed/stream/route.ts"), "utf8");
  if (streamSrc.includes("getStream") && streamSrc.includes("items")) ok("GET /api/feed/stream uses getStream and returns items");
  else ng("GET /api/feed/stream", "missing getStream or items in source");
  if (streamSrc.includes("force-dynamic")) ok("GET /api/feed/stream has dynamic force-dynamic");
  else ng("GET /api/feed/stream dynamic", "missing force-dynamic");

  const postsSrc = fs.readFileSync(path.join(ROOT, "app/api/feed/posts/route.ts"), "utf8");
  if (postsSrc.includes("createPost") && postsSrc.includes("POST")) ok("POST /api/feed/posts uses createPost");
  else ng("POST /api/feed/posts createPost", "missing createPost or POST");
  if (postsSrc.includes("content is required") || postsSrc.includes("content") && postsSrc.includes("400")) ok("POST /api/feed/posts validates content (400 if missing)");
  else ng("POST /api/feed/posts validation", "missing content validation");

  // Also verify like/pin/comment routes exist and have correct handlers
  const likeSrc = fs.readFileSync(path.join(ROOT, "app/api/feed/posts/[id]/like/route.ts"), "utf8");
  if (likeSrc.includes("toggleLike")) ok("POST /api/feed/posts/[id]/like uses toggleLike");
  else ng("POST /like route", "missing toggleLike");

  const pinSrc = fs.readFileSync(path.join(ROOT, "app/api/feed/posts/[id]/pin/route.ts"), "utf8");
  if (pinSrc.includes("togglePin")) ok("POST /api/feed/posts/[id]/pin uses togglePin");
  else ng("POST /pin route", "missing togglePin");

  const commentSrc = fs.readFileSync(path.join(ROOT, "app/api/feed/posts/[id]/comments/route.ts"), "utf8");
  if (commentSrc.includes("addComment")) ok("POST /api/feed/posts/[id]/comments uses addComment");
  else ng("POST /comments route", "missing addComment");
} catch (e) { ng("feed API", e.message.slice(0, 800)); }

// 6. Fleet telemetry — GET /api/fleet/telemetry still works
section("6. Fleet telemetry — GET /api/fleet/telemetry");
try {
  const telSrc = fs.readFileSync(path.join(ROOT, "app/api/fleet/telemetry/route.ts"), "utf8");
  if (telSrc.includes("currentTelemetry") && telSrc.includes("GET")) ok("GET /api/fleet/telemetry returns currentTelemetry");
  else ng("GET /api/fleet/telemetry", "missing currentTelemetry or GET");
  if (telSrc.includes("evaluateTelemetry") || telSrc.includes("alerts")) ok("telemetry route handles alerts");
  else ng("telemetry alerts", "missing evaluateTelemetry/alerts");

  // Functional check of evaluateTelemetry
  require("tsx/cjs");
  const { evaluateTelemetry: evalTel } = require(path.join(ROOT, "packages/modules/fleet/telemetryService.ts"));
  const alerts1 = evalTel(-10, "CLOSED", null);
  if (alerts1.includes("WARNING_HIGH_TEMP")) ok("evaluateTelemetry -10C triggers HIGH_TEMP");
  else ng("evaluateTelemetry -10C", JSON.stringify(alerts1));
  const alerts2 = evalTel(-18, "CLOSED", null);
  if (!alerts2.includes("WARNING_HIGH_TEMP")) ok("evaluateTelemetry -18C no HIGH_TEMP");
  else ng("evaluateTelemetry -18C", JSON.stringify(alerts2));
  const alerts3 = evalTel(-18, "OPEN", new Date(Date.now() - 11 * 60 * 1000).toISOString());
  if (alerts3.includes("WARNING_DOOR_OPEN")) ok("evaluateTelemetry door OPEN >10m triggers DOOR_OPEN");
  else ng("evaluateTelemetry door >10m", JSON.stringify(alerts3));
  const alerts4 = evalTel(-18, "OPEN", new Date().toISOString());
  if (!alerts4.includes("WARNING_DOOR_OPEN")) ok("evaluateTelemetry door OPEN <10m no alert");
  else ng("evaluateTelemetry door <10m", JSON.stringify(alerts4));
} catch (e) { ng("fleet telemetry", e.message.slice(0, 800) + "\n" + (e.stack||"").slice(0,600)); }

// 7. Prisma schema — FeedPost, FeedComment, FeedLike models exist
section("7. Prisma schema — FeedPost, FeedComment, FeedLike");
try {
  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  if (schema.includes("model FeedPost")) ok("model FeedPost exists");
  else ng("model FeedPost", "not found in schema.prisma");
  if (schema.includes("model FeedComment")) ok("model FeedComment exists");
  else ng("model FeedComment", "not found in schema.prisma");
  if (schema.includes("model FeedLike")) ok("model FeedLike exists");
  else ng("model FeedLike", "not found in schema.prisma");
  if (schema.includes("@@map(\"feed_posts\")")) ok("FeedPost @@map feed_posts");
  else ng("FeedPost @@map", "missing @@map feed_posts");
  if (schema.includes("@@map(\"feed_comments\")")) ok("FeedComment @@map feed_comments");
  else ng("FeedComment @@map", "missing");
  if (schema.includes("@@map(\"feed_likes\")")) ok("FeedLike @@map feed_likes");
  else ng("FeedLike @@map", "missing");
  if (schema.includes("@@unique([postId, userId])")) ok("FeedLike @@unique([postId, userId])");
  else ng("FeedLike @@unique", "missing unique constraint");
  if (schema.includes("onDelete: Cascade")) ok("FeedComment/FeedLike onDelete: Cascade");
  else ng("onDelete Cascade", "missing");
} catch (e) { ng("prisma schema", e.message.slice(0, 800)); }

console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
process.exit(fail > 0 ? 1 : 0);
