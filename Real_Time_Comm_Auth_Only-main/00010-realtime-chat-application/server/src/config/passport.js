import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  linkGoogleAccount,
} from '../DAO/user.dao.js';

/**
 * Runs after Passport has exchanged Google's ?code for tokens and fetched the profile.
 * Find-or-create: returning Google user → log in; same verified email → link; otherwise → register.
 * @param {string} accessToken @param {string} refreshToken @param {object} profile @param {Function} done
 */
async function verifyGoogleProfile(accessToken, refreshToken, profile, done) {
  try {
    // 1. Seen this Google account before? → log in
    const googleUser = await findUserByGoogleId(profile.id);
    if (googleUser) {
      return done(null, googleUser);
    }

    // Only trust an email Google has verified, otherwise anyone could claim someone else's account.
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email || profile._json?.email_verified !== true) {
      return done(null, false);
    }
    const avatar = profile.photos?.[0]?.value;

    // 2. Registered earlier with email + password? → link Google to that account
    const emailUser = await findUserByEmail(email);
    if (emailUser) {
      return done(null, await linkGoogleAccount(String(emailUser._id), profile.id, avatar));
    }

    // 3. Brand new → register (no password needed for Google accounts)
    const name = (profile.displayName?.trim() || email.split('@')[0]).slice(0, 50);
    const user = await createUser({ googleId: profile.id, email, name, avatar });
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

passport.use(new GoogleStrategy(
  {
    clientID: env.googleClientId,
    clientSecret: env.googleClientSecret,
    callbackURL: env.googleCallbackUrl,
  },
  verifyGoogleProfile,
));

export { passport };
