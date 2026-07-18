import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment-view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments.query-params.input-dto';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @Inject() private readonly postsRepository: PostsRepository,
  ) {}

  async getCommentByIdOrFail(id: string, userId: string) {
    const found = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    })
      .populate([
        { path: 'likesCount' },
        { path: 'dislikesCount' },
        this.userLikeStatusPopulate(userId),
      ])
      .exec();

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(found);
  }

  async getCommentsByPostIdOrFail(
    postId: string,
    userId: string,
    query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsRepository.getByIdOrF ail(postId);

    const filter = {
      postId,
      deletedAt: null,
    };

    const [totalCount, comments] = await Promise.all([
      this.CommentModel.countDocuments(filter),
      this.CommentModel.find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .populate([
          { path: 'likesCount' },
          { path: 'dislikesCount' },
          this.userLikeStatusPopulate(userId),
        ])
        .exec(),
    ]);

    const data = {
      totalCount,
      items: comments.map(CommentViewDto.mapToView),
      page: query.pageNumber,
      size: query.pageSize,
    } satisfies MappedPaginatedViewType<CommentViewDto[]>;

    return PaginatedViewDto.mapToView(data);
  }

  private userLikeStatusPopulate(userId: string) {
    return {
      path: 'userLikeStatus',
      match: {
        userId: Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : new Types.ObjectId(),
      },
    };
  }
}
