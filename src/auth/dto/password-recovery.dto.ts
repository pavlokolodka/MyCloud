import { Types } from 'mongoose';

export interface IPasswordRecovery {
  email: string;
  userName: string;
  userId: Types.ObjectId;
}
