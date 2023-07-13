import { Types } from 'mongoose';
import { IUser } from './users.interface';

export enum ProviderType {
  Google = 'google',
  Facebook = 'facebook',
  Linkedin = 'linkedin',
  GitHub = 'github',
}
type PorviderValues = (typeof ProviderType)[keyof typeof ProviderType];

export const providerValues: PorviderValues[] = Object.values(ProviderType);

export interface ISocialAccount {
  _id: Types.ObjectId;
  userId: IUser['_id'];
  provider: ProviderType;
  providerId: string;
  profileUrl?: string;
}
