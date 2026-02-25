import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto, CreateCommentDto } from './blog.dto';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    let exists = await this.prisma.blog.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (exists) {
      slug = `${slug}-${Date.now()}`;
    }
    return slug;
  }

  async createBlog(userId: string, dto: CreateBlogDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.blog.create({
      data: {
        userId,
        title: dto.title,
        slug,
        content: dto.content,
        isPublished: dto.isPublished ?? false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateBlog(userId: string, id: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException('Not your blog');

    const data: any = { ...dto };
    if (dto.title && dto.title !== blog.title) {
      data.slug = await this.generateUniqueSlug(dto.title, id);
    }

    return this.prisma.blog.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteBlog(userId: string, id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException('Not your blog');

    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Blog deleted successfully' };
  }

  async getMyBlogs(userId: string) {
    return this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async getBlogById(userId: string, id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== userId) throw new ForbiddenException('Not your blog');
    return blog;
  }

  async toggleLike(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    const existing = await this.prisma.like.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { userId_blogId: { userId, blogId } },
      });
    } else {
      await this.prisma.like.create({ data: { userId, blogId } });
    }

    const likeCount = await this.prisma.like.count({ where: { blogId } });
    return { liked: !existing, likeCount };
  }

  async getLikeStatus(userId: string, blogId: string) {
    const like = await this.prisma.like.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });
    const likeCount = await this.prisma.like.count({ where: { blogId } });
    return { liked: !!like, likeCount };
  }

  async createComment(userId: string, blogId: string, dto: CreateCommentDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    return this.prisma.comment.create({
      data: { userId, blogId, content: dto.content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getComments(blogId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
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