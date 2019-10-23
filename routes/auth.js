const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const passport = require("passport");
var UserDB = require("../models/user");
/* POST login. */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            return next(err);
        }
       req.login(user, (err) => {
           var result = {};
           if (err) {
            return next(err);
           }
           
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign({_id: user._id, username: user.username}, process.env.SECRET_KEY);
           return res.status(200).send({id: user._id, username: user.username, token});
        });
    })(req, res, next);
       
});


function UserRegisterValidation(data, cb) {
    UserDB.getFromUsername(data.username, function (err, data){
        if (err)  return cb("Unknown error. Please register again!");
        if (data) return cb("This username has already taken. Please use another one!");
        cb(null);
    });
}
router.post('/register',function (req, res, next) {
    var data = {
        username: req.query.username,
        password: req.query.password,
        email: req.query.email
        
    };

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
                    console.log("[UserController] Success create user with ID: " + id);
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
    })
});



module.exports = router;