import mongoose from 'mongoose';

export enum RegistrationType {
  Email = 'email',
  Phone = 'phone',
  Social = 'social',
}

type RegistrationTypeValues =
  (typeof RegistrationType)[keyof typeof RegistrationType];

export const registrationTypeValues: RegistrationTypeValues[] =
  Object.values(RegistrationType);

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  registrationMethod: RegistrationType;
  createdAt: Date;
  updatedAt: Date;
}
