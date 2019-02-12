const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  customer: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model('ChatbotData', schema);
