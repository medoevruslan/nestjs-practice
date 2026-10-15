export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}
export class Like {
  parentId: string;

  parentType: string;

  userId: string;

  login: string;

  status: LikeStatus;

  createdAt: Date;
  updatedAt: Date;
}
