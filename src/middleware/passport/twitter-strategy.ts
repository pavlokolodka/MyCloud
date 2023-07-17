import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-twitter';
// import { Strategy as LinkedInStrategy } from '@superfaceai/passport-twitter-oauth2';
import { SocialProfileData } from './types';
const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_CALLBACK_URL } =
  process.env;

passport.use(
  new LinkedInStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY as string,
      consumerSecret: TWITTER_CONSUMER_SECRET as string,
      callbackURL: TWITTER_CALLBACK_URL as string,
    },
    function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (arg0: null | any, arg1: any) => any,
    ) {
      console.log(profile);
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
