import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
const { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, FACEBOOK_CALLBACK_URL } =
  process.env;

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID as string,
      clientSecret: FACEBOOK_CLIENT_SECRET as string,
      callbackURL: FACEBOOK_CALLBACK_URL as string,
      profileFields: ['picture.type(large)', 'id', 'displayName', 'emails'],
    },
    function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      cb: (arg0: null | any, arg1: any) => any,
    ) {
      const porfileObject = {
        ...profile._json,
        picture: profile._json.picture.data.url,
      };
      return cb(null, porfileObject);
    },
  ),
);
