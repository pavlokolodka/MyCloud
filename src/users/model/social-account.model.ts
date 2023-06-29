import { Schema, model } from 'mongoose';
import { ISocialAccount, providerValues } from './social-account.interface';

const SocialAccountSchema: Schema<ISocialAccount> = new Schema<ISocialAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: {
      type: String,
      enum: {
        values: providerValues,
        message: '{VALUE} provider is not supported',
      },
    },
    providerId: { type: String, required: true },
    profileUrl: { type: String },
  },
  { timestamps: true },
);

export const SocialAccount = model<ISocialAccount>(
  'SocialAccount',
  SocialAccountSchema,
);
