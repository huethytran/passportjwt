//const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var UserModel = require("../models/user");
var bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        // mặc định local strategy sử dụng username và password,
        // chúng ta cần cấu hình lại
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        UserModel.getFromUsername(username, function (err, data){
            if (!data ) {
              return done(null, false, { message: 'Invalid username.' });
            }
            var ret = bcrypt.compareSync(password,data.password);
      
            if (ret) {
              return done(null, data);
            }
            else{
              return done(null, false, { message: 'Invalid password.' });
            }
      
          })
    }
));
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : process.env.SECRET_KEY
},
function (jwtPayload, done) {
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return UserModel.getFromId(jwtPayload._id, function (err, user){
        if (user)
          return done(null, user);
        else
            return done(err);
    }
)}));
  passport.serializeUser((user, done) => {
    return done(null, user);
  });

  passport.deserializeUser((user, done) => {
    return done(null, user);
  });
}