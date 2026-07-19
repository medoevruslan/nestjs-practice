import { Length } from "class-validator";

export class CreateCommentDto {
  @Length(20, 200)
  content: string;

  userId: string;
  postId: string;
}
