import mongoose from 'mongoose';
import { IUser } from '../../users/model/users.interface';
export interface IFile {
  _id: mongoose.Types.ObjectId;
  name: string;
  storageId?: string;
  link?: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  userId: IUser['_id'];
  childs?: IFile['_id'][];
  parent: IFile['_id'] | null;
  save: () => Promise<this>;
}
