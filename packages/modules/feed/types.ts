export type FeedTag = "thong-bao" | "khen-thuong" | "kho-van" | "kinh-doanh" | "khan-cap";
export type FeedAuthorRole = "Giam doc" | "Ke toan" | "Thu kho" | "Tai xe" | "He thong";

export interface FeedPost {
  id: string;
  author: string;
  authorRole: FeedAuthorRole;
  avatar: string;
  content: string;
  tag: FeedTag;
  pinned: boolean;
  likes: number;
  likedByMe: boolean;
  comments: FeedComment[];
  createdAt: string;
}

export interface FeedComment {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  content: string;
  createdAt: string;
  replies?: FeedComment[];
}

export type ActivityType = "order_new" | "vietqr" | "fleet_move" | "fefo_done";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  amount?: number;
  aliasCode?: string;
  temperature?: number;
  createdAt: string;
}

export interface FeedStreamItem {
  kind: "post" | "activity";
  pinned?: boolean;
  createdAt: string;
  post?: FeedPost;
  activity?: ActivityEvent;
}
