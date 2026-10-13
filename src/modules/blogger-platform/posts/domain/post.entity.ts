import { UpdatePostDto } from '../dto/update-post.dto';
export class Post {
  realtionalId: string;

  title: string;

  shortDescription: string;

  content: string;

  blogId: string;

  blogName: string;

  deletedAt: Date | null;

  set id(id: string) {
    this.realtionalId = id;
  }

  get id() {
    return this.realtionalId;
  }

  createdAt: Date;
  updatedAt: Date;

  markDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  public update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.blogId = dto.blogId;
  }
}
