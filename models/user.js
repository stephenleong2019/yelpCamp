const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// Do not need set password in user schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// passport local mongoose will handle the password
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
