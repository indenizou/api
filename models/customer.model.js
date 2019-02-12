const mongoose = require('mongoose');
const shortid = require('shortid');
const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Email = require('../libs/email');
const config = require('../config');
const FilesSchema = require('./files.model');

const isProd = process.env.NODE_ENV === 'production';

const schema = new mongoose.Schema({
  _id: { type: String, default: shortid.generate },
  password: { type: String, required: [false, 'Must provide a password'], select: false },
  name: { type: String, trim: true },
  profilePicture: { type: String },
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
  outros: { type: String },
  contactby: { type: String, default: 'email', enum: ['email', 'whatsapp', 'phone'] },
  assunto: {
    type: String,
    enum: config.assuntos,
    required: [true, 'É necessário fornecer o assunto'],
  },

  status: {
    type: String,
    enum: config.pipelines,
    required: [true, 'É necessário fornecer "status" (etapa do pipeline)'],
  },

  mailchimp: {
    tags: { type: Array },
    id: { type: String },
    list_id: { type: String },
    campaign_id: { type: String },
    unique_email_id: { type: String },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional'],
      required: [isProd, 'É necessário fornecer o status de inscricao (mailchimp)'],
    },
    abuse: { type: Boolean, default: false },
  },

  files: [FilesSchema],

  // Facebook tokens
  facebook_short_access_token: { type: String, trim: true },
  facebook_access_token: { type: String, trim: true },
  facebook_tokens_generated_at: Date,

  // Forgot password attributes
  reset_password_token: { type: String, trim: true },
  reset_password_at: Date,

}, { versionKey: false, timestamps: true });

const transformID = {
  virtuals: true,
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  transform: function deleteID(doc, ret) { delete ret._id; },
};
schema.set('toJSON', transformID);
schema.set('toObject', transformID);

schema.pre('save', function save(next) {
  if (!this.password) return next();

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

module.exports = mongoose.model('Customer', schema);
