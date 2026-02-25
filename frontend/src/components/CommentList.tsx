'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { blogApi } from '@/lib/api';
import { Comment } from '@/types';

interface CommentListProps {
  blogId: string;
  isPublic?: boolean;
}

export function CommentList({ blogId, isPublic = false }: CommentListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    blogApi
      .getComments(blogId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [blogId]);

  const handleSubmit = async () => {
    if (!user) { router.push('/login'); return; }
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const newComment = await blogApi.createComment(blogId, content.trim());
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } catch (e: any) {
      setError(e.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      {!isPublic && (
        <div className="comment-form">
          <textarea
            placeholder={user ? 'Write a comment...' : 'Login to comment'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!user || submitting}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={!user || submitting || !content.trim()}
            >
              {submitting ? '...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <div className="loading-state">Loading comments...</div>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div>
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="comment-author">
                  {c.user.name || c.user.email.split('@')[0]}
                </span>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}