import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import User from '../models/User';
import { authenticateUser } from '../services/authService';

dotenv.config();

passport.use(new LocalStrategy({
    usernameField: 'email',
  }, async (email, password, done) => {
    try {
      const user = await authenticateUser(email, password);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.query().findOne({ googleId: profile.id });
      if (!user) {
        user = await User.query().insert({
          googleId: profile.id,
          email: profile.emails?.[0].value,
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'mysecret'
  }, async (jwtPayload, done) => {
    try {
      const user = await User.query().findById(jwtPayload.id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
