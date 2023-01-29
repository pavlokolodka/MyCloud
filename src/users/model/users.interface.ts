import mongoose from "mongoose";
import { IFile } from "../../files/model/files.interface";



export interface IUser {
  _id?: mongoose.Types.ObjectId,
  name: string,
  email: string, 
  password: string,
  date?: Date,
  updatedAt?: Date, 
  save?: () => Promise<this>;
}
