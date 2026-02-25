export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { likes: number; comments: number };
}

export interface FeedBlog {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  publishedAt: string;
  author: { id: string; name?: string; email: string };
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name?: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}