var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
require('dotenv').config();
var uri = process.env.DB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  numOfWordInPassword: Number,
  imageUrl: String,
  facebookProvider: {
    type: {
        id: String,
        token: String
    },
    select: false
},
googleProvider: {
    type: {
        id: String,
        token: String
    },
    select: false
}
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
exports.findByIdAndUpdate = function(_id,data, cb) {
 
  UserModel.findByIdAndUpdate(_id, data,{new: true}, function (err, record) {
    if (err) return cb(err);
    if (!record) return cb("Not Found");
     cb(null, record);

});
  
}
exports.updateImageUrl = function(_id,data, cb) {
 
  UserModel.findByIdAndUpdate(_id, {imageUrl: data},{new: true}, function (err, record) {
    if (err) return cb(err);
    if (!record) return cb("Not Found");
     cb(null, record);
});
}
exports.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
   UserModel.findOne({
      'facebookProvider.id': profile.id
  }, function(err, user) {
      // no user was found, lets create a new one
      
      if (!user) {
          var newUser = new UserModel({
              username: profile.displayName,
              email: profile.emails[0].value,
              imageUrl: profile.photos[0].value,
              facebookProvider: {
                  id: profile.id,
                  token: accessToken
              }
          });

          newUser.save(function(error, savedUser) {
              if (error) {
                  console.log(error);
              }
              return cb(error, savedUser);
          });
      } else {
          return cb(err, user);
      }
  });
};

exports.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
   UserModel.findOne({
      'googleProvider.id': profile.id
  }, function(err, user) {
      console.log("profile", profile);
      // no user was found, lets create a new one
      if (!user) {
          var newUser = new UserModel({
              username: profile.displayName,
              email: profile.emails[0].value,
              imageUrl: profile._json.picture,
              googleProvider: {
                  id: profile.id,
                  token: accessToken
              }
          });

          newUser.save(function(error, savedUser) {
              if (error) {
                  console.log(error);
              }
              return cb(error, savedUser);
          });
      } else {
          return cb(err, user);
      }
  });
};