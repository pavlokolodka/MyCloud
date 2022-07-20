import { Schema, model } from 'mongoose';
import { IFile } from './files.interface'



const fileSchema = new Schema<IFile>({
  name: {
    type: String,
    require: true
  },
  storageId: {
    type: String,
    require: true
  },
  link: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});


export const File = model<IFile>('Files', fileSchema);