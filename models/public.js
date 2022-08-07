const mongoose = require('mongoose');
const { setMaxListeners } = require('./person');
const Schema = mongoose.Schema;


const messageSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    required: true
  }
})


const publicSchema = new Schema({
  name: {
    type: String,
    default: 'Public'
  },
  newletterEmails: [{
    type: String
  }],
  messages: [messageSchema]
})


module.exports = mongoose.model('Public', publicSchema);
