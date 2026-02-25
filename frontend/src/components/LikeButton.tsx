'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { blogApi } from '@/lib/api';

interface LikeButtonProps {
  blogId: string;
  initialCount: number;
}

export function LikeButton({ blogId, initialCount }: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      blogApi.getLikeStatus(blogId).then((res) => {
        setLiked(res.liked);
        setCount(res.likeCount);
      }).catch(() => {});
    }
  }, [blogId, user]);

  const handleClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (loading) return;
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => wasLiked ? c - 1 : c + 1);
    setLoading(true);
    try {
      const res = await blogApi.toggleLike(blogId);
      setLiked(res.liked);
      setCount(res.likeCount);
    } catch {
      // Revert
      setLiked(wasLiked);
      setCount((c) => wasLiked ? c + 1 : c - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`like-btn${liked ? ' liked' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {liked ? '❤️' : '🤍'} {count} {count === 1 ? 'like' : 'likes'}
    </button>
  );
}