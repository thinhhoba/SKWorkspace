import type { FeedPost, FeedComment, FeedTag, FeedAuthorRole, ActivityEvent, ActivityType, FeedStreamItem } from "./types";
import { SEED_POSTS, SEED_ACTIVITIES } from "./mockData";

// In-memory stores
let posts: FeedPost[] = SEED_POSTS.map((p) => ({ ...p, comments: [...p.comments] }));
let activities: ActivityEvent[] = [...SEED_ACTIVITIES];

// Track likes per user to support likedByMe
const likeMap = new Map<string, Set<string>>(); // postId -> Set<userId>

// Helpers
function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Optional Prisma fallback
async function tryPrisma<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// CRUD Posts
export function getPosts(): FeedPost[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getPostById(id: string): FeedPost | undefined {
  return posts.find((p) => p.id === id);
}

export function createPost(input: { author?: string; authorRole?: FeedAuthorRole; avatar?: string; content: string; tag: FeedTag }): FeedPost {
  const post: FeedPost = {
    id: genId("post"),
    author: input.author ?? "Ho Ba Thinh",
    authorRole: input.authorRole ?? "Giam doc",
    avatar: input.avatar ?? "📌",
    content: input.content,
    tag: input.tag,
    pinned: false,
    likes: 0,
    likedByMe: false,
    comments: [],
    createdAt: nowIso(),
  };
  posts.unshift(post);
  return post;
}

export function toggleLike(postId: string, userId = "me"): { liked: boolean; likes: number } | null {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  let set = likeMap.get(postId);
  if (!set) {
    set = new Set<string>();
    likeMap.set(postId, set);
  }
  const had = set.has(userId);
  if (had) {
    set.delete(userId);
    post.likes = Math.max(0, post.likes - 1);
    if (userId === "me") post.likedByMe = false;
  } else {
    set.add(userId);
    post.likes += 1;
    if (userId === "me") post.likedByMe = true;
  }
  return { liked: !had, likes: post.likes };
}

export function togglePin(postId: string): { pinned: boolean } | null {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  post.pinned = !post.pinned;
  return { pinned: post.pinned };
}

export function addComment(
  postId: string,
  input: { author?: string; content: string; parentId?: string | null },
): FeedComment | null {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  const comment: FeedComment = {
    id: genId("c"),
    postId,
    parentId: input.parentId ?? null,
    author: input.author ?? "Toi (Nhan vien truc)",
    content: input.content,
    createdAt: nowIso(),
  };
  post.comments.push(comment);
  return comment;
}

// Activities
export function generateActivity(type: ActivityType, data: Partial<ActivityEvent> & { title: string; description: string }): ActivityEvent {
  const ev: ActivityEvent = {
    id: genId("act"),
    type,
    title: data.title,
    description: data.description,
    amount: data.amount,
    aliasCode: data.aliasCode,
    temperature: data.temperature,
    createdAt: nowIso(),
  };
  activities.unshift(ev);
  if (activities.length > 100) activities.pop();
  return ev;
}

export function getActivities(): ActivityEvent[] {
  return [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Stream — merge posts + activities, pinned posts first, then by createdAt desc
export function getStream(): FeedStreamItem[] {
  const postItems: FeedStreamItem[] = getPosts().map((p) => ({
    kind: "post" as const,
    pinned: p.pinned,
    createdAt: p.createdAt,
    post: p,
  }));
  const actItems: FeedStreamItem[] = getActivities().map((a) => ({
    kind: "activity" as const,
    createdAt: a.createdAt,
    activity: a,
  }));
  const all = [...postItems, ...actItems];
  all.sort((a, b) => {
    const aPinned = a.kind === "post" && a.pinned ? 1 : 0;
    const bPinned = b.kind === "post" && b.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return all;
}

// Async wrappers with Prisma fallback (for future DB use)
export async function getPostsAsync(): Promise<FeedPost[]> {
  return tryPrisma(async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient() as unknown as { feedPost: { findMany: (a: unknown) => Promise<never[]> } };
    const rows = await prisma.feedPost.findMany({ include: { comments: true }, orderBy: { createdAt: "desc" } });
    // map to FeedPost shape — simplified
    return rows.map((r: { id: string; author: string; authorRole: string; avatar: string; content: string; tag: string; pinned: boolean; likes: number; createdAt: Date; comments: FeedComment[] }) => ({
      id: r.id,
      author: r.author,
      authorRole: r.authorRole as FeedAuthorRole,
      avatar: r.avatar,
      content: r.content,
      tag: r.tag as FeedTag,
      pinned: r.pinned,
      likes: r.likes,
      likedByMe: false,
      comments: r.comments as unknown as FeedComment[],
      createdAt: r.createdAt.toISOString(),
    }));
  }, getPosts());
}

export function resetStore() {
  posts = SEED_POSTS.map((p) => ({ ...p, comments: [...p.comments] }));
  activities = [...SEED_ACTIVITIES];
  likeMap.clear();
}
