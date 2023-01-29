import { Schema, model } from 'mongoose';
import { IUser } from './users.interface';



const userSchema = new Schema<IUser>({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


export const User = model<IUser>('User', userSchema);