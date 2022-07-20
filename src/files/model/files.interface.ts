import { ObjectId } from "mongoose";



export interface IFile {
  _id?: ObjectId,
  name: string,
  storageId: string,
  link: string,
  date?: Date
}
