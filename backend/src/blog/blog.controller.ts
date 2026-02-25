import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto, CreateCommentDto } from './blog.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('blogs')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post()
  createBlog(@CurrentUser() user: JwtPayload, @Body() dto: CreateBlogDto) {
    return this.blogService.createBlog(user.sub, dto);
  }

  @Get()
  getMyBlogs(@CurrentUser() user: JwtPayload) {
    return this.blogService.getMyBlogs(user.sub);
  }

  @Get(':id')
  getBlogById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.blogService.getBlogById(user.sub, id);
  }

  @Patch(':id')
  updateBlog(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteBlog(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.blogService.deleteBlog(user.sub, id);
  }

  @Post(':id/like')
  toggleLike(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.blogService.toggleLike(user.sub, id);
  }

  @Get(':id/like')
  getLikeStatus(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.blogService.getLikeStatus(user.sub, id);
  }

  @Post(':id/comments')
  createComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blogService.createComment(user.sub, id, dto);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.blogService.getComments(id);
  }
}