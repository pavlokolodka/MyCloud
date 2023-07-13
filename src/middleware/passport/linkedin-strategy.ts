import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { SocialProfileData } from './types';
const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_CALLBACK_URL } =
  process.env;

passport.use(
  new LinkedInStrategy(
    {
      clientID: LINKEDIN_CLIENT_ID as string,
      clientSecret: LINKEDIN_CLIENT_SECRET as string,
      callbackURL: LINKEDIN_CALLBACK_URL as string,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (arg0: null | any, arg1: any) => any,
    ) {
      const profileObject: SocialProfileData = {
        id: profile.id,
        name: profile.displayName,
        picture: profile.photos[profile.photos.length - 1].value,
        email: profile.emails[0].value,
        provider: profile.provider,
      };

      return done(null, profileObject);
    },
  ),
);
