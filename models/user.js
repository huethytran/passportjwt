var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
require('dotenv').config();
var uri = process.env.DB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  name: String,
  age: Number,
  gender: String,
  email: String
})

var UserModel = mongoose.model("User", userSchema);
exports.create = function (userData, cb) {
  bcrypt.hash(userData.password, 10, function (err, hash) {
      if (err) {
          console.log("[UserModel] Failed to encrypt password of " + userData.username);
          return cb(err);
      }
      userData.password = hash;
      UserModel.create(userData, function (err, data) {
          if (err) {
              console.log("[UserModel] Failed to add " + userData.username + " to database.\nError: " + err);
              return cb(err);
          }
          else {
              return cb(null, data._id);
          }

      });
  });
}

exports.getFromId = function (id, cb) {
  UserModel.findOne({ _id: id}, function (err, data) {
      if (err) return cb(err);
      cb(null, data);
  })
}
exports.getFromUsername = function (_username, cb) {
  UserModel.findOne({ username: _username}, function (err, data) {
      if (err) return cb(err);
      cb(null, data);
  })
}