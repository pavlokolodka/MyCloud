import { Schema, model } from 'mongoose';
import { IFile } from './files.interface'



const fileSchema = new Schema<IFile>({
  name: {
    type: String,
    require: true
  },
  storageId: {
    type: String
  },
  link: {
    type: String
  },
  size: {
    type: Number,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'File'
  },
  childs: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  date: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


export const File = model<IFile>('File', fileSchema);