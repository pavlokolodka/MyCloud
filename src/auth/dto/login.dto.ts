import { Types } from 'mongoose';
export interface ILoginDto {
  password: string;
  userPassword: string;
  userName: string;
  userId: Types.ObjectId;
  email: string;
  isVerified: boolean;
}
