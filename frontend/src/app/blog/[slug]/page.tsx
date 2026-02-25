'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { LikeButton } from '@/components/LikeButton';
import { CommentList } from '@/components/CommentList';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicApi
      .getBlogBySlug(slug)
      .then(setBlog)
      .catch((e) => {
        if (e.message.includes('404') || e.message.toLowerCase().includes('not found')) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-state">Loading...</div>;

  if (notFound) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Blog not found</div>
        <p>This blog doesn&apos;t exist or isn&apos;t published yet.</p>
        <Link href="/feed" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Back to Feed
        </Link>
      </div>
    );
  }

  if (!blog) return null;

  const authorName = blog.author?.name || blog.author?.email?.split('@')[0];
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="blog-detail">
      <h1 className="blog-detail-title">{blog.title}</h1>
      <div className="blog-detail-meta">
        <span>By {authorName}</span>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span>💬 {blog.commentCount} comments</span>
      </div>

      <div className="blog-detail-content">{blog.content}</div>

      <div style={{ marginBottom: '2rem' }}>
        <LikeButton blogId={blog.id} initialCount={blog.likeCount} />
      </div>

      <CommentList blogId={blog.id} />
    </article>
  );
}