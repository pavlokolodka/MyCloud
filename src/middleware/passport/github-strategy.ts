import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-github';
import { SocialProfileData } from './types';
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } =
  process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GITHUB_CLIENT_ID as string,
      clientSecret: GITHUB_CLIENT_SECRET as string,
      callbackURL: GITHUB_CALLBACK_URL as string,
      scope: ['email', 'profile'],
    },
    function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (arg0: null | any, arg1: any) => any,
    ) {
      const profileObject: SocialProfileData = {
        id: profile._json.id,
        name: profile._json.name,
        picture: profile._json.avatar_url,
        email: profile._json.email,
        provider: profile.provider,
      };

      return done(null, profileObject);
    },
  ),
);
