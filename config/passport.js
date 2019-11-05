//const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
var FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var UserModel = require("../models/user");
var bcrypt = require('bcryptjs');
var config = require('./config');
require('dotenv').config();

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        // mặc định local strategy sử dụng username và password,
        // chúng ta cần cấu hình lại
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done) {
      console.log("password",password);
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        UserModel.getFromUsername(username, function (err, data){
            if (!data ) {
              return done("Invalid username.", false);
            }
            var ret = bcrypt.compareSync(password,data.password);
      
            if (ret) {
              return done(null, data);
            }
            else{
              return done("Invalid password.", false);
            }
      
          })
    }
));
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : process.env.SECRET_KEY
},
function (jwtPayload, done) {
  console.log(jwtPayload._id);
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return UserModel.getFromId(jwtPayload._id, function (err, user){
        if (user)
          return done(null, user);
        else
            return done(err);
    }
)}));
passport.use(new FacebookTokenStrategy({
  clientID: config.facebookAuth.clientID,
  clientSecret: config.facebookAuth.clientSecret
},
function (accessToken, refreshToken, profile, done) {
  UserModel.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
  });
}));

passport.use(new GoogleTokenStrategy({
  clientID: config.googleAuth.clientID,
  clientSecret: config.googleAuth.clientSecret
},
function (accessToken, refreshToken, profile, done) {
  UserModel.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
  });
}));
  passport.serializeUser((user, done) => {
    return done(null, user);
  });

  passport.deserializeUser((user, done) => {
    return done(null, user);
  });
}