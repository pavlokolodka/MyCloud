import { ProviderType } from '../model/social-account.interface';

export interface UpsertUserWithSocialAccountDto {
  name: string;
  email: string;
  openId: string;
  pictureUrl: string;
  provider: ProviderType;
}
