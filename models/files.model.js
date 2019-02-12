const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  path: { type: String, trim: true },
  name: String,
  encoding: String,
  mimetype: String,
  size: Number,
}, { timestamps: false });

const transformID = {
  virtuals: true,
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  transform: function deleteID(doc, ret) { delete ret._id; },
};
schema.set('toJSON', transformID);
schema.set('toObject', transformID);

module.exports = schema;
