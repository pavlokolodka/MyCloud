import { Schema, model } from 'mongoose';
import { IUser, registrationTypeValues } from './users.interface';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    registrationMethod: {
      type: String,
      enum: {
        values: registrationTypeValues,
        message: '{VALUE} registration method is not supported',
      },
    },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
