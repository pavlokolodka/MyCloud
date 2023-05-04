import { Types } from 'mongoose';

export interface DeleteFromParentDto {
  fileId: Types.ObjectId;
  parentId: Types.ObjectId;
  userId: Types.ObjectId;
}
