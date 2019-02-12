const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

function tokenForUser(user) {
  return jwt.sign({ sub: user.id, iat: new Date().getTime() }, process.env.JWT_SECRET);
}

// User has already had their email and password auth'd
// We just need to give them a token
exports.signin = (req, res) => res.json({ token: tokenForUser(req.user) });

exports.signup = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: 'You must provide email and password' });
  }

  // See if a user with the given email exists
  return User.findOne({ email }, (err, existingUser) => {
    if (err) return next(err);

    // If a user with email does exist, return an error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a user with email does NOT exist, create and save user record
    const user = new User({ email, password });

    return user.save((errr) => {
      if (errr) return next(errr);

      // Repond to request indicating the user was created
      return res.json({ token: tokenForUser(user) });
    });
  });
};
