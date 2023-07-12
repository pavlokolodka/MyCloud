import { ProviderType } from '../../users/model/social-account.interface';

export interface SocialProfileData {
  id: string;
  name: string;
  picture: string;
  email: string;
  provider: ProviderType;
}
