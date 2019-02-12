const { ExtractJwt, Strategy } = require('passport-jwt');
const LocalStrategy = require('passport-local');
const User = require('../models/user.model');

// Setup options for local strategy
const localOptions = { usernameField: 'email', session: false };

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.JWT_SECRET,
};

// Verify this email and password, call done with the user
// if it is the correct email and password
// otherwise, call done with false
exports.localLogin = new LocalStrategy(localOptions, (email, password, done) => User
  .findOne({ email }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false);

    // compare passwords - is `password` equal to user.password?
    return user.comparePassword(password, (errr, isMatch) => {
      if (errr) return done(errr);
      if (!isMatch) return done(null, false);

      return done(null, user);
    });
  }).select('password'));

// Create JWT strategy
// See if the user ID in the payload exists in our database
// If it does, call 'done' with that other
// otherwise, call done without a user object
exports.jwtLogin = new Strategy(jwtOptions, (payload, done) => User
  .findById(payload.sub, (err, user) => {
    if (err) return done(err, false);
    if (user) return done(null, user);

    return done(null, false);
  }));
