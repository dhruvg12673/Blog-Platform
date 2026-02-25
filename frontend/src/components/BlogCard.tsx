import Link from 'next/link';
import { FeedBlog } from '@/types';

interface BlogCardProps {
  blog: FeedBlog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const authorName = blog.author.name || blog.author.email.split('@')[0];
  const date = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${blog.slug}`} style={{ display: 'block' }}>
      <div className="blog-card">
        <div className="blog-card-meta">
          <span>By {authorName}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
        <h2 className="blog-card-title">{blog.title}</h2>
        {blog.summary && <p className="blog-card-summary">{blog.summary}</p>}
        <div className="blog-card-stats">
          <span>❤️ {blog.likeCount} likes</span>
          <span>💬 {blog.commentCount} comments</span>
        </div>
      </div>
    </Link>
  );
}