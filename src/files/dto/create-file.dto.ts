import { Types } from 'mongoose';

export interface CreateFileDto {
  name: string;
  type: string;
  parent: Types.ObjectId | null;
  userId: Types.ObjectId;
  link?: string;
  storageId?: string;
  size: number;
  childs: null | Array<Types.ObjectId>;
}
