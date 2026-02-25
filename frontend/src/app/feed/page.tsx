'use client';

import { useState, useEffect } from 'react';
import { BlogCard } from '@/components/BlogCard';
import { publicApi } from '@/lib/api';
import { FeedBlog, PaginatedResponse } from '@/types';

export default function FeedPage() {
  const [data, setData] = useState<PaginatedResponse<FeedBlog> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    publicApi
      .getFeed(page, 10)
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load feed'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="feed-header">
        <h1 className="feed-title">Public Feed</h1>
        {data && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {data.meta.total} posts
          </span>
        )}
      </div>

      {loading && (
        <div className="loading-state">
          <p>Loading posts...</p>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      {!loading && data && data.data.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No posts yet</div>
          <p>Be the first to publish a blog!</p>
        </div>
      )}

      {!loading && data && data.data.length > 0 && (
        <>
          <div className="feed-grid">
            {data.data.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Page {page} of {data.meta.totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.meta.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}