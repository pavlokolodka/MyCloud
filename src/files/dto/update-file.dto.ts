import { Types } from 'mongoose';

export interface UpdateFileDto {
  fileId: Types.ObjectId;
  name?: string;
  parent?: Types.ObjectId;
}
