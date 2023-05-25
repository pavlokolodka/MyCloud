import { Types } from 'mongoose';

export interface DeleteFromParentDto {
  fileId: Types.ObjectId;
  directorySize: number;
  parentId: Types.ObjectId;
  userId: Types.ObjectId;
}
