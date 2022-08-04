import mongoose from "mongoose";



export interface IFile {
  _id?: mongoose.Types.ObjectId,
  name: string,
  storageId?: string, // | null
  link?: string,
  size?: number,
  date?: Date,
  updatedAt?: Date,
  type: string,
  childs?: IFile['_id'][], // / []
  parent: IFile['_id'] | null,
  save?: () => Promise<this>;
}
