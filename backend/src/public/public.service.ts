import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getFeed(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.blog.count({ where: { isPublished: true } }),
    ]);

    return {
      data: blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary,
        publishedAt: blog.createdAt,
        author: blog.user,
        likeCount: blog._count.likes,
        commentCount: blog._count.comments,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBlogBySlug(slug: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog) throw new NotFoundException('Blog not found');

    return {
      ...blog,
      author: blog.user,
      likeCount: blog._count.likes,
      commentCount: blog._count.comments,
    };
  }

  async getComments(blogId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id: blogId, isPublished: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');

    return this.prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}