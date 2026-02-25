const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Auth
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<any>('/auth/me', {}, true),
};

// Blogs (private)
export const blogApi = {
  list: () => request<any[]>('/blogs', {}, true),

  get: (id: string) => request<any>(`/blogs/${id}`, {}, true),

  create: (data: { title: string; content: string; isPublished?: boolean }) =>
    request<any>('/blogs', { method: 'POST', body: JSON.stringify(data) }, true),

  update: (id: string, data: { title?: string; content?: string; isPublished?: boolean }) =>
    request<any>(`/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, true),

  delete: (id: string) =>
    request<any>(`/blogs/${id}`, { method: 'DELETE' }, true),

  toggleLike: (id: string) =>
    request<{ liked: boolean; likeCount: number }>(`/blogs/${id}/like`, { method: 'POST' }, true),

  getLikeStatus: (id: string) =>
    request<{ liked: boolean; likeCount: number }>(`/blogs/${id}/like`, {}, true),

  createComment: (id: string, content: string) =>
    request<any>(`/blogs/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }, true),

  getComments: (id: string) =>
    request<any[]>(`/blogs/${id}/comments`, {}, true),
};

// Public
export const publicApi = {
  getFeed: (page = 1, limit = 10) =>
    request<any>(`/public/feed?page=${page}&limit=${limit}`),

  getBlogBySlug: (slug: string) =>
    request<any>(`/public/blogs/${slug}`),

  getComments: (blogId: string) =>
    request<any[]>(`/public/blogs/${blogId}/comments`),
};