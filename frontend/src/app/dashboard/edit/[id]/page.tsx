'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { blogApi } from '@/lib/api';

function EditBlogContent() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    blogApi
      .get(id)
      .then((blog) => {
        setTitle(blog.title);
        setContent(blog.content);
        setIsPublished(blog.isPublished);
      })
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await blogApi.update(id, { title, content, isPublished });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update blog');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Loading blog...</div>;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard" className="btn btn-outline btn-sm">← Back</Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Edit Blog</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={10}
            style={{ minHeight: '350px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="toggle-wrapper" style={{ cursor: 'pointer' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </label>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/dashboard" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditBlogPage() {
  return (
    <ProtectedRoute>
      <EditBlogContent />
    </ProtectedRoute>
  );
}