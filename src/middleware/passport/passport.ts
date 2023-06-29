import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      callbackURL: GOOGLE_CALLBACK_URL as string,
      passReqToCallback: true,
      scope: ['email', 'profile'],
    },
    function (
      request: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (arg0: null | any, arg1: any) => any,
    ) {
      return done(null, profile._json);
    },
  ),
);
