import { ProviderType } from '../../users/model/social-account.interface';

export interface GoogleProfileData {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export interface FacebookProfileData {
  id: string;
  name: string;
  picture: string;
  email: string;
}

export interface LinkedinProfileData {
  id: string;
  name: string;
  picture: string;
  email: string;
}

export interface SocialProfileData {
  id: string;
  name: string;
  picture: string;
  email: string;
  provider: ProviderType;
}
