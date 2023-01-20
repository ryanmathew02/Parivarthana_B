const mongoose = require('mongoose');
const Schema  = mongoose.Schema;


const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    verified: Boolean
});

const user = mongoose.model('users', UserSchema);

module.exports = user;