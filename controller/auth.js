const jwt = require('jsonwebtoken');
const passport = require("passport");
var UserDB = require("../models/user");
var bcrypt = require('bcryptjs');
var helper = require("../helper");

module.exports = {
    register: _post_register,
    login: _post_login,
    changePassword: _post_changepassword,
    updateinfo: _post_updateinfo,
    avatar: _post_avatar,
    getinfo: _get_information,
    forgotpassword: _post_forgotpassword,
    validateToken: _validateToken,
    loginFacebook: _post_login_facebook,
    loginGoogle: _post_login_google
}
function _post_login_facebook(req, res, next){
    passport.authenticate('facebook-token', (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        const token = jwt.sign({_id: user._id}, process.env.SECRET_KEY);
        return res.status(200).send({username: user.username, email: user.email,imageUrl:user.imageUrl, token});
    })(req, res, next);
}
function _post_login_google(req, res, next){
    passport.authenticate('google-token', (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        const token = jwt.sign({_id: user._id}, process.env.SECRET_KEY);
        return res.status(200).send({username: user.username, email: user.email,imageUrl:user.imageUrl, token});
    })(req, res, next);
}
function _post_login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            return res.status(404).send(err);
        }
       req.login(user, (err) => {
           
           if (err) {
            return res.status(404).send(err);
           }
           
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign({_id: user._id}, process.env.SECRET_KEY);
           return res.status(200).send({id: user._id, username: user.username, email: user.email, numOfWordInPassword: user.numOfWordInPassword, token});
        });
    })(req, res, next);
       
}
function UserRegisterValidation(data, cb) {
    UserDB.getFromUsername(data.username, function (err, data){
        if (err)  return cb("Unknown error. Please register again!");
        if (data) return cb("This username has already taken. Please use another one!");
        cb(null);
    });
}
function _post_register(req, res){
    var data = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        numOfWordInPassword: req.body.password.length
    };
    console.log("register",req.body);
    var result = {};
    var status = 200;
    UserRegisterValidation(data, function (msg) {
        if (msg == null) {
            UserDB.create(data, function (err, id) {
                if (err) {
                    console.log("[UserController] Failed to add user to database: " + err);
                    status = 500;
                    result.status = status;
                    result.error = "There was an error creating the database. Please try again!"
                    res.status(status).send(result);
                } else {
                    console.log("[AuthController] Success create user with ID: " + id);
                    status = 200;
                    result.status = status;
                    result.id = id;
                    res.status(status).send(result);
                }
            });
        } else {
            status = 406;
            result.status = status;
            result.error = msg;
            res.status(status).send(result);
        }
    });
}
function _validateToken(req, res, next) {
    var token = req.body.token || req.query.token;
    if (!token) {
        console.log('[AuthController] Missing token');
        return res.status(401).send("No token provided.");
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) =>{      
        if (err) {
          return res.status(401).send("invalid token");
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
}
function _post_changepassword(req,res){
    var data = {
        password: req.body.password,
        newpassword: req.body.newpassword,
        numOfWordInPassword: req.body.newpassword.length
    };
    UserDB.getFromId(req.decoded._id, function (err, user){
        if (user){
          var ret = bcrypt.compareSync(data.password, user.password);
            if (ret) {
                bcrypt.hash(data.newpassword, 10, function (err, hash) {
                    if (err) 
                        return res.status(406).send("[UserDB] Failed to encrypt password of " + user.username);
                else UserDB.findByIdAndUpdate(req.decoded._id, {password: hash, numOfWordInPassword: data.numOfWordInPassword}, function (err, data){
                    if (!data || err ) {
                      return res.status(406).send("Change password failed.");
                    }
                    else return res.sendStatus(200);
            });
        });
    }
            else return res.status(406).send("Invalid password");
    }
    else return res.status(406).send("Change password failed.");
    });
}
function _post_updateinfo(req, res){
    var data = {
        username: req.body.username,
        email: req.body.email
    };
    UserDB.getFromUsername(data.username, function (err, kq){
        if (err)  return res.status(406).send("Update username failed.");
        else if (kq) return res.status(406).send("This username has already taken. Please use another one!");
        else {
            UserDB.findByIdAndUpdate(req.decoded._id, data, function (err, data){
                if (!data || err ) {
                  return res.status(406).send("Update info failed.");
                }
                else return res.status(200).send({username: data.username, email: data.email});
            });
        }
    });
    
}
function _post_forgotpassword(req, res) {
    UserDB.getFromUsername(req.body.username, function (err, record) {
        if (err) 
            return res.status(500).send('Unknown error. Please try again.');
        if (!record) 
            return res.status(402).send('Username does not exist');
        helper.user.SendPasswordResetMail("localhost:4000", record.email, record._id, function (error, key) {
            if (error) 
                return res.status(500).send('Unknown error. Please try again.');
                 else return res.status(200).send('Email was sent successfully. Please check your email to validate password.');
        });
    });
}
function _post_avatar(req, res) {
    var imageUrl = req.body.imageUrl;
    UserDB.updateImageUrl(req.decoded._id, imageUrl, function (err, data){
        console.log(data.imageUrl);
         if (!data || err ) {
            return res.status(406).send("Upload avatar failed.");
         }
         else return res.status(200).send(data.imageUrl);
    });
}
function _get_information(req, res){
    UserDB.getFromId(req.decoded._id, function(err, data){
        if (err || !data) return res.status(406). send("Error. Get user info failed.");
        else return res.status(200).send(data);
    });
}