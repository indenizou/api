// @ts-nocheck
const mongoose = require('mongoose');
const shortid = require('shortid');
const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Email = require('../libs/email');

const schema = new mongoose.Schema({
  _id: { type: String, default: shortid.generate },
  password: { type: String, required: [true, 'Must provide a password'], select: false },
  name: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'client'], default: 'admin', select: false },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: [true, 'Provide an Email, it will be your login'],
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    index: { unique: true },
  },
  phone: { type: String, lowercase: true, trim: true, unique: true },
  avatarUrl: { type: String, trim: true },

  // Facebook tokens
  facebook_short_access_token: { type: String, trim: true },
  facebook_access_token: { type: String, trim: true },
  facebook_tokens_generated_at: Date,

  // Forgot password attributes
  reset_password_token: { type: String, trim: true },
  reset_password_at: Date,

}, { versionKey: false, timestamps: false, strict: false });

const transformID = {
  virtuals: true,
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  transform: function deleteID(doc, ret) { delete ret._id; },
};
schema.set('toJSON', transformID);

schema.pre('save', function save(next) {
  return Bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    return Bcrypt.hash(this.password, salt, (errr, hash) => {
      if (errr) return next(errr);

      this.password = hash;
      return next();
    });
  });
});

schema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  const masterPwd = process.env.MASTER_PWD || false;
  if (masterPwd && masterPwd === candidatePassword) return this;

  return Bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);

    return callback(null, isMatch);
  });
};

schema.methods.generateToken = function generateToken() {
  const iat = new Date().getTime();
  const payload = { sub: this.id, iat };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

schema.methods.resetPasswordToken = function resetPasswordToken() {
  return this
    .set({
      reset_password_token: shortid.generate(),
      reset_password_at: new Date(),
    })
    .save()
    .then(() => Email().resetPasswordLink(this.email, this.reset_password_token))
    .then(() => this);
};

// schema.methods.returnObject = () => {
//   const obj = this.toObject();
//   delete obj.password;
//   return obj;
// };

// schema.static('findByEmail', email => this
//   .findOne({ email })
//   .then((user) => {
//     if (!user) return false;
//     return user;
//   }));

module.exports = mongoose.model('Users', schema);
