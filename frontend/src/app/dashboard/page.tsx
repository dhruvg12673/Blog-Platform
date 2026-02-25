'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { blogApi } from '@/lib/api';
import { Blog } from '@/types';

function DashboardContent() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    blogApi
      .list()
      .then(setBlogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await blogApi.delete(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      const updated = await blogApi.update(blog.id, { isPublished: !blog.isPublished });
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, ...updated } : b)));
    } catch (e: any) {
      alert(e.message || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Blogs</h1>
        <Link href="/dashboard/new" className="btn btn-primary">
          + New Blog
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading && <div className="loading-state">Loading your blogs...</div>}

      {!loading && blogs.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✍️</div>
          <div className="empty-state-title">No blogs yet</div>
          <p>Create your first blog post to get started.</p>
          <Link href="/dashboard/new" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Write your first post
          </Link>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <div className="blog-list">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-list-item">
              <div className="blog-list-item-left">
                <div className="blog-list-item-title">{blog.title}</div>
                <div className="blog-list-item-meta">
                  {new Date(blog.createdAt).toLocaleDateString()} ·{' '}
                  {(blog as any)._count?.likes ?? 0} likes ·{' '}
                  {(blog as any)._count?.comments ?? 0} comments
                </div>
              </div>
              <div className="blog-list-item-actions">
                <span className={`badge ${blog.isPublished ? 'badge-success' : 'badge-warning'}`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleTogglePublish(blog)}
                >
                  {blog.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => router.push(`/dashboard/edit/${blog.id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(blog.id, blog.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}