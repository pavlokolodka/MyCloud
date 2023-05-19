import { Types } from 'mongoose';

export interface IResendEmail {
  userId: Types.ObjectId;
  email: string;
  name: string;
}
